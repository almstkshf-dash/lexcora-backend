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
    created_by 
  } = data;

  let debitAccountCode, creditAccountCode;

  // Simple mapping logic for automated posting
  switch (event) {
    case 'INVOICE_CREATED':
      // Debit: Accounts Receivable (1103)
      // Credit: Legal Services Revenue (4100)
      debitAccountCode = '1103';
      creditAccountCode = '4100';
      break;
    case 'PAYMENT_RECEIVED':
    case 'CLIENT_DEPOSIT':
      // Debit: Bank Accounts (1102) or Cash (1101)
      // Credit: Accounts Receivable (1103)
      debitAccountCode = data.bank_account_id ? '1102' : '1101';
      creditAccountCode = '1103';
      break;
    case 'BILL_RECEIVED':
      // Debit: Operating Expenses (5100)
      // Credit: Accounts Payable (2101)
      debitAccountCode = '5100';
      creditAccountCode = '2101';
      break;
    case 'PAYMENT_MADE':
      // Debit: Accounts Payable (2101)
      // Credit: Bank Accounts (1102) or Cash (1101)
      debitAccountCode = '2101';
      creditAccountCode = data.bank_account_id ? '1102' : '1101';
      break;
    case 'EXPENSE_PAID':
      // Debit: Operating Expenses (5100)
      // Credit: Bank Accounts (1102) or Cash (1101)
      debitAccountCode = '5100';
      creditAccountCode = data.bank_account_id ? '1102' : '1101';
      break;
    default:
      throw new Error(`Unsupported event type: ${event}`);
  }

  // Get account IDs
  const [debitAcc] = await db.query("SELECT id FROM accounts WHERE code = ?", [debitAccountCode]);
  const [creditAcc] = await db.query("SELECT id FROM accounts WHERE code = ?", [creditAccountCode]);

  if (!debitAcc[0] || !creditAcc[0]) {
    throw new Error(`Accounts not found for codes: ${debitAccountCode}, ${creditAccountCode}`);
  }

  const entryData = {
    entry_date: new Date(),
    reference_number: reference,
    description: description,
    currency_code: currency,
    exchange_rate: exchange_rate,
    status: 'posted', // Automated entries are usually posted immediately
    created_by: created_by,
    branch_id: branch_id
  };

  const items = [
    {
      account_id: debitAcc[0].id,
      description: description,
      debit: amount,
      credit: 0,
      party_id,
      employee_id,
      branch_id
    },
    {
      account_id: creditAcc[0].id,
      description: description,
      debit: 0,
      credit: amount,
      party_id,
      employee_id,
      branch_id
    }
  ];

  return await journalEntriesModel.createJournalEntry(entryData, items, connection);
};

/**
 * Generates a Profit and Loss report.
 */
const getProfitAndLoss = async (filters = {}) => {
  const trialBalance = await journalEntriesModel.getTrialBalance(filters);
  
  const revenue = trialBalance.data.filter(a => a.type === 'revenue');
  const expenses = trialBalance.data.filter(a => a.type === 'expense');

  const totalRevenue = revenue.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0) * -1; // Revenue usually has credit balance
  const totalExpenses = expenses.reduce((sum, a) => sum + parseFloat(a.balance || 0), 0);

  return {
    revenue,
    expenses,
    totalRevenue,
    totalExpenses,
    netProfit: totalRevenue - totalExpenses
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
    isBalanced: Math.abs(totalAssets - (totalLiabilities + totalEquityWithProfit)) < 0.01
  };
};

module.exports = {
  postAutomatedEntry,
  getProfitAndLoss,
  getBalanceSheet
};
