const journalEntriesModel = require("../models/journalEntriesModel");
const db = require("../config/db");

/**
 * Automates the posting of financial transactions based on business events.
 */
const postAutomatedEntry = async (event, data, connection = null) => {
  const { 
    amount, 
    currency = 'AED', 
    exchange_rate = 1.0, 
    description, 
    reference, 
    party_id, 
    employee_id, 
    branch_id,
    case_id,
    project_id,
    department_id,
    created_by 
  } = data;

  // Get dynamic posting settings for this event
  const [settingsRows] = await db.query(
    "SELECT debit_account_id, credit_account_id, description_template FROM posting_settings WHERE event_key = ? AND is_active = TRUE", 
    [event]
  );

  if (settingsRows.length === 0) {
    throw new Error(`Active posting settings not found for event: ${event}`);
  }

  const { debit_account_id, credit_account_id, description_template } = settingsRows[0];

  // Resolve description template if needed
  let finalDescription = description;
  if (description_template && data) {
      finalDescription = description_template.replace(/{(\w+)}/g, (match, key) => {
          return data[key] !== undefined ? data[key] : match;
      });
  }

  const entryData = {
    entry_date: new Date(),
    reference_number: reference,
    description: finalDescription,
    currency_code: currency,
    exchange_rate: exchange_rate,
    status: 'posted', // Automated entries are usually posted immediately
    created_by: created_by,
    branch_id: branch_id
  };

  const items = [
    {
      account_id: debit_account_id,
      description: finalDescription,
      debit: amount,
      credit: 0,
      party_id,
      employee_id,
      branch_id,
      case_id,
      project_id,
      department_id
    },
    {
      account_id: credit_account_id,
      description: finalDescription,
      debit: 0,
      credit: amount,
      party_id,
      employee_id,
      branch_id,
      case_id,
      project_id,
      department_id
    }
  ];

  return await journalEntriesModel.createJournalEntry(entryData, items, connection);
};

/**
 * Posts an automated entry with multiple splits (e.g., shared expenses).
 */
const postSplitAutomatedEntry = async (event, data, connection = null) => {
  const { 
    currency = 'AED', 
    exchange_rate = 1.0, 
    reference, 
    party_id, 
    employee_id, 
    branch_id, 
    created_by,
    splits // Array of { amount, description, case_id, project_id, department_id }
  } = data;

  const [settingsRows] = await db.query(
    "SELECT debit_account_id, credit_account_id FROM posting_settings WHERE event_key = ? AND is_active = TRUE", 
    [event]
  );

  if (settingsRows.length === 0) {
    throw new Error(`Active posting settings not found for event: ${event}`);
  }

  const { debit_account_id, credit_account_id } = settingsRows[0];
  const totalAmount = splits.reduce((sum, s) => sum + parseFloat(s.amount), 0);

  const entryData = {
    entry_date: new Date(),
    reference_number: reference,
    description: `Split Posting for ${event}: ${reference}`,
    currency_code: currency,
    exchange_rate: exchange_rate,
    status: 'posted',
    created_by: created_by,
    branch_id: branch_id
  };

  const items = [];

  // Add debit lines for each split
  for (const split of splits) {
    items.push({
      account_id: debit_account_id,
      description: split.description,
      debit: split.amount,
      credit: 0,
      party_id,
      employee_id,
      branch_id,
      case_id: split.case_id,
      project_id: split.project_id,
      department_id: split.department_id
    });
  }

  // Add single credit line for the total
  items.push({
    account_id: credit_account_id,
    description: `Total for ${event}: ${reference}`,
    debit: 0,
    credit: totalAmount,
    party_id,
    employee_id,
    branch_id
  });

  return await journalEntriesModel.createJournalEntry(entryData, items, connection);
};

/**
 * Generates a Profit and Loss report.
 */
const getProfitAndLoss = async (filters = {}) => {
  const trialBalance = await journalEntriesModel.getTrialBalance(filters);
  
  const revenue = trialBalance.data.filter(a => a.type === 'revenue');
  const expenses = trialBalance.data.filter(a => a.type === 'expense');

  const totalRevenue = revenue.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0) * -1; 
  const totalExpenses = expenses.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0);

  return {
    revenue,
    expenses,
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses,
    currency: filters.consolidate ? 'AED' : (filters.currency_code || 'AED')
  };
};

/**
 * Generates a Balance Sheet report.
 */
const getBalanceSheet = async (filters = {}) => {
  const trialBalance = await journalEntriesModel.getTrialBalance(filters);
  
  const assets = trialBalance.data.filter(a => a.type === 'asset');
  const liabilities = trialBalance.data.filter(a => a.type === 'liability');
  const equity = trialBalance.data.filter(a => a.type === 'equity');

  const totalAssets = assets.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0);
  const totalLiabilities = liabilities.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0) * -1;
  const totalEquity = equity.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0) * -1;

  // Add net profit from P&L to equity
  const pnl = await getProfitAndLoss(filters);
  const totalEquityWithProfit = totalEquity + pnl.netProfit;

  return {
    assets,
    liabilities,
    equity,
    totalAssets,
    totalLiabilities,
    totalEquity: totalEquityWithProfit,
    isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquityWithProfit)) < 0.01,
    currency: filters.consolidate ? 'AED' : (filters.currency_code || 'AED')
  };
};

/**
 * Validates a journal entry.
 */
const validateJournalEntry = (items) => {
  if (!items || items.length < 2) {
    throw new Error("Journal entry must have at least two items.");
  }

  const totalDebit = items.reduce((sum, item) => sum + parseFloat(item.debit || 0), 0);
  const totalCredit = items.reduce((sum, item) => sum + parseFloat(item.credit || 0), 0);

  // Use a small epsilon for float comparison
  if (Math.abs(totalDebit - totalCredit) > 0.001) {
    throw new Error(`Journal entry is not balanced. Total Debit: ${totalDebit}, Total Credit: ${totalCredit}`);
  }

  if (totalDebit <= 0) {
    throw new Error("Journal entry amount must be greater than zero.");
  }

  return true;
};

/**
 * Creates a manual journal entry with validation.
 */
const createManualJournalEntry = async (entryData, items) => {
  validateJournalEntry(items);
  return await journalEntriesModel.createJournalEntry(entryData, items);
};

module.exports = {
  postAutomatedEntry,
  getProfitAndLoss,
  getBalanceSheet,
  validateJournalEntry,
  createManualJournalEntry,
  postSplitAutomatedEntry
};
