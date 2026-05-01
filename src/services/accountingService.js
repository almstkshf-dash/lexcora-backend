const journalEntriesModel = require("../models/journalEntriesModel");
const fiscalPeriodsModel = require("../models/fiscalPeriodsModel");
const budgetsModel = require("../models/budgetsModel");
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
 * Generates a Profit and Loss report with hierarchical rollup.
 */
const getProfitAndLoss = async (filters = {}) => {
  const trialBalance = await journalEntriesModel.getTrialBalance(filters);
  const accounts = trialBalance.data;
  
  // 1. Build Account Map with full data
  const accountMap = {};
  accounts.forEach(a => {
    accountMap[a.account_id] = { 
      ...a, 
      balance: parseFloat(a.balance || 0), 
      children_balance: 0,
      children: [] 
    };
  });

  // 2. Build Hierarchy & Calculate Rollups
  // Sort by code length descending to process children before parents
  const sortedAccounts = [...accounts].sort((a, b) => b.code.length - a.code.length);
  
  sortedAccounts.forEach(account => {
    const current = accountMap[account.account_id];
    if (account.parent_id && accountMap[account.parent_id]) {
        const parent = accountMap[account.parent_id];
        parent.children_balance += (current.balance + current.children_balance);
        parent.children.unshift(current); // Add to children list
    }
  });

  // 3. Finalize balances and filter roots
  const processedAccounts = Object.values(accountMap).map(a => ({
    ...a,
    total_balance: a.balance + a.children_balance
  }));

  const revenue = processedAccounts.filter(a => a.type === 'revenue' && !a.parent_id);
  const expenses = processedAccounts.filter(a => a.type === 'expense' && !a.parent_id);

  const totalRevenue = revenue.reduce((sum, a) => sum + a.total_balance, 0) * -1; 
  const totalExpenses = expenses.reduce((sum, a) => sum + a.total_balance, 0);

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
 * Generates a Balance Sheet report with hierarchical rollup.
 */
const getBalanceSheet = async (filters = {}) => {
  const trialBalance = await journalEntriesModel.getTrialBalance(filters);
  const accounts = trialBalance.data;
  
  const accountMap = {};
  accounts.forEach(a => {
    accountMap[a.account_id] = { 
      ...a, 
      balance: parseFloat(a.balance || 0), 
      children_balance: 0,
      children: []
    };
  });

  const sortedAccounts = [...accounts].sort((a, b) => b.code.length - a.code.length);
  sortedAccounts.forEach(account => {
    const current = accountMap[account.account_id];
    if (account.parent_id && accountMap[account.parent_id]) {
        const parent = accountMap[account.parent_id];
        parent.children_balance += (current.balance + current.children_balance);
        parent.children.unshift(current);
    }
  });

  const processedAccounts = Object.values(accountMap).map(a => ({
    ...a,
    total_balance: a.balance + a.children_balance
  }));

  const assets = processedAccounts.filter(a => a.type === 'asset' && !a.parent_id);
  const liabilities = processedAccounts.filter(a => a.type === 'liability' && !a.parent_id);
  const equity = processedAccounts.filter(a => a.type === 'equity' && !a.parent_id);

  const totalAssets = assets.reduce((sum, a) => sum + a.total_balance, 0);
  const totalLiabilities = liabilities.reduce((sum, a) => sum + a.total_balance, 0) * -1;
  const totalEquity = equity.reduce((sum, a) => sum + a.total_balance, 0) * -1;

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
  
  // Check if period is open
  const isOpen = await fiscalPeriodsModel.isPeriodOpen(entryData.entry_date, entryData.branch_id);
  if (!isOpen) {
    throw new Error(`The fiscal period for date ${entryData.entry_date} is closed or not defined.`);
  }

  return await journalEntriesModel.createJournalEntry(entryData, items);
};

const getBudgetVsActual = async (filters) => {
  return await budgetsModel.getBudgetVsActual(filters);
};

/**
 * Generates an Aged Receivables (AR) report.
 */
const getAgedReceivables = async (filters = {}) => {
  const { branch_id, client_id } = filters;
  let query = `
    SELECT 
      p.id as client_id, p.name as client_name,
      DATEDIFF(CURDATE(), i.invoice_date) as days_old,
      (i.amount - COALESCE(SUM(pay.amount), 0)) as balance
    FROM invoices i
    JOIN parties p ON i.client_id = p.id
    LEFT JOIN payments pay ON i.id = pay.invoice_id
    WHERE i.status != 'paid' AND i.status != 'cancelled'
  `;
  const params = [];
  if (branch_id) { query += " AND i.branch_id = ?"; params.push(branch_id); }
  if (client_id) { query += " AND i.client_id = ?"; params.push(client_id); }

  query += " GROUP BY i.id, p.id, p.name, i.invoice_date, i.amount";

  const [rows] = await db.query(query, params);
  
  const partyMap = {};

  rows.forEach(row => {
    const balance = parseFloat(row.balance);
    if (balance <= 0) return;

    if (!partyMap[row.client_id]) {
      partyMap[row.client_id] = {
        party_name: row.client_name,
        '0-30': 0,
        '31-60': 0,
        '61-90': 0,
        '90+': 0,
        total_balance: 0
      };
    }

    const party = partyMap[row.client_id];
    party.total_balance += balance;

    if (row.days_old <= 30) party['0-30'] += balance;
    else if (row.days_old <= 60) party['31-60'] += balance;
    else if (row.days_old <= 90) party['61-90'] += balance;
    else party['90+'] += balance;
  });

  return Object.values(partyMap);
};

/**
 * Generates an Aged Payables (AP) report.
 */
const getAgedPayables = async (filters = {}) => {
  const { branch_id, vendor_id } = filters;
  let query = `
    SELECT 
      p.id as vendor_id, p.name as vendor_name,
      DATEDIFF(CURDATE(), b.bill_date) as days_old,
      (b.amount - COALESCE(SUM(pay.amount), 0)) as balance
    FROM bills b
    JOIN parties p ON b.vendor_id = p.id
    LEFT JOIN payments pay ON b.id = pay.bill_id
    WHERE b.status != 'paid' AND b.status != 'cancelled'
  `;
  const params = [];
  if (branch_id) { query += " AND b.branch_id = ?"; params.push(branch_id); }
  if (vendor_id) { query += " AND b.vendor_id = ?"; params.push(vendor_id); }

  query += " GROUP BY b.id, p.id, p.name, b.bill_date, b.amount";

  const [rows] = await db.query(query, params);
  
  const partyMap = {};

  rows.forEach(row => {
    const balance = parseFloat(row.balance);
    if (balance <= 0) return;

    if (!partyMap[row.vendor_id]) {
      partyMap[row.vendor_id] = {
        party_name: row.vendor_name,
        '0-30': 0,
        '31-60': 0,
        '61-90': 0,
        '90+': 0,
        total_balance: 0
      };
    }

    const party = partyMap[row.vendor_id];
    party.total_balance += balance;

    if (row.days_old <= 30) party['0-30'] += balance;
    else if (row.days_old <= 60) party['31-60'] += balance;
    else if (row.days_old <= 90) party['61-90'] += balance;
    else party['90+'] += balance;
  });

  return Object.values(partyMap);
};

/**
 * Generates a financial summary for a specific case.
 */
const getCaseFinancialSummary = async (caseId) => {
  const [ledgerRows] = await db.query(`
    SELECT 
      a.type,
      SUM(le.base_debit) as total_debit,
      SUM(le.base_credit) as total_credit
    FROM ledger_entries le
    JOIN accounts a ON le.account_id = a.id
    JOIN journal_entries je ON le.journal_entry_id = je.id
    WHERE le.case_id = ? AND je.status = 'posted'
    GROUP BY a.type
  `, [caseId]);

  const summary = {
    income: 0,
    expense: 0,
    profit: 0,
    receivable: 0,
    payable: 0
  };

  ledgerRows.forEach(row => {
    const balance = parseFloat(row.total_debit) - parseFloat(row.total_credit);
    if (row.type === 'revenue') summary.income = Math.abs(balance);
    else if (row.type === 'expense') summary.expense = balance;
    else if (row.type === 'asset') summary.receivable = balance; // Simplified: assumes assets for case are receivables
    else if (row.type === 'liability') summary.payable = Math.abs(balance);
  });

  summary.profit = summary.income - summary.expense;
  return summary;
};

/**
 * Generates a financial summary for a specific party (client).
 */
const getPartyFinancialSummary = async (partyId) => {
  const [ledgerRows] = await db.query(`
    SELECT 
      a.type,
      SUM(le.base_debit) as total_debit,
      SUM(le.base_credit) as total_credit
    FROM ledger_entries le
    JOIN accounts a ON le.account_id = a.id
    JOIN journal_entries je ON le.journal_entry_id = je.id
    WHERE le.party_id = ? AND je.status = 'posted'
    GROUP BY a.type
  `, [partyId]);

  const summary = {
    income: 0,
    expense: 0,
    profit: 0,
    receivable: 0,
    payable: 0
  };

  ledgerRows.forEach(row => {
    const balance = parseFloat(row.total_debit) - parseFloat(row.total_credit);
    if (row.type === 'revenue') summary.income = Math.abs(balance);
    else if (row.type === 'expense') summary.expense = balance;
    else if (row.type === 'asset') summary.receivable = balance; 
    else if (row.type === 'liability') summary.payable = Math.abs(balance);
  });

  summary.profit = summary.income - summary.expense;
  return summary;
};

module.exports = {
  postAutomatedEntry,
  getProfitAndLoss,
  getBalanceSheet,
  validateJournalEntry,
  createManualJournalEntry,
  postSplitAutomatedEntry,
  getAgedReceivables,
  getAgedPayables,
  getCaseFinancialSummary,
  getPartyFinancialSummary,
  getBudgetVsActual,
  getTrialBalance: async (filters) => {
    return await journalEntriesModel.getTrialBalance(filters);
  },
  
  /**
   * Generates a Cash Flow statement (Simplified Direct Method for current period)
   */
  getCashFlow: async (filters = {}) => {
    const trialBalance = await journalEntriesModel.getTrialBalance(filters);
    const accounts = trialBalance.data;
    
    const operating = [];
    const investing = [];
    const financing = [];
    
    accounts.forEach(acc => {
      const balance = parseFloat(acc.balance || 0);
      if (Math.abs(balance) < 0.01) return;
      
      // Categorize based on account type and common code patterns
      // Operating: Revenue, Expenses, Current Assets, Current Liabilities
      if (acc.type === 'revenue' || acc.type === 'expense') {
        operating.push(acc);
      } else if (acc.type === 'asset' && acc.code.startsWith('11')) { // 11 typically Current Assets
        operating.push(acc);
      } else if (acc.type === 'liability' && acc.code.startsWith('21')) { // 21 typically Current Liabilities
        operating.push(acc);
      }
      // Investing: Fixed Assets
      else if (acc.type === 'asset' && acc.code.startsWith('12')) { // 12 typically Non-current Assets
        investing.push(acc);
      }
      // Financing: Equity, Long-term Loans
      else if (acc.type === 'equity' || (acc.type === 'liability' && acc.code.startsWith('22'))) {
        financing.push(acc);
      }
      else {
        // Default to operating if unclear
        operating.push(acc);
      }
    });

    const sumBalance = (list) => list.reduce((sum, a) => sum + parseFloat(a.balance), 0);

    const netOperating = sumBalance(operating) * -1; // Reverse sign for net cash
    const netInvesting = sumBalance(investing) * -1;
    const netFinancing = sumBalance(financing) * -1;

    return {
      operating,
      investing,
      financing,
      netOperating,
      netInvesting,
      netFinancing,
      netCashFlow: netOperating + netInvesting + netFinancing,
      currency: filters.currency_code || 'AED'
    };
  },

  /**
   * Generates a financial summary for a specific Project.
   */
  getProjectFinancialSummary: async (projectId) => {
    const [ledgerRows] = await db.query(`
      SELECT 
        a.type,
        SUM(le.base_debit) as total_debit,
        SUM(le.base_credit) as total_credit
      FROM ledger_entries le
      JOIN accounts a ON le.account_id = a.id
      JOIN journal_entries je ON le.journal_entry_id = je.id
      WHERE le.project_id = ? AND je.status = 'posted'
      GROUP BY a.type
    `, [projectId]);

    const summary = { income: 0, expense: 0, profit: 0, receivable: 0, payable: 0 };
    ledgerRows.forEach(row => {
      const balance = parseFloat(row.total_debit) - parseFloat(row.total_credit);
      if (row.type === 'revenue') summary.income = Math.abs(balance);
      else if (row.type === 'expense') summary.expense = balance;
      else if (row.type === 'asset') summary.receivable = balance;
      else if (row.type === 'liability') summary.payable = Math.abs(balance);
    });
    summary.profit = summary.income - summary.expense;
    return summary;
  },

  /**
   * Generates a financial summary for a specific Department / Cost Center.
   */
  getDepartmentFinancialSummary: async (departmentId) => {
    const [ledgerRows] = await db.query(`
      SELECT 
        a.type,
        SUM(le.base_debit) as total_debit,
        SUM(le.base_credit) as total_credit
      FROM ledger_entries le
      JOIN accounts a ON le.account_id = a.id
      JOIN journal_entries je ON le.journal_entry_id = je.id
      WHERE le.department_id = ? AND je.status = 'posted'
      GROUP BY a.type
    `, [departmentId]);

    const summary = { income: 0, expense: 0, profit: 0, receivable: 0, payable: 0 };
    ledgerRows.forEach(row => {
      const balance = parseFloat(row.total_debit) - parseFloat(row.total_credit);
      if (row.type === 'revenue') summary.income = Math.abs(balance);
      else if (row.type === 'expense') summary.expense = balance;
      else if (row.type === 'asset') summary.receivable = balance;
      else if (row.type === 'liability') summary.payable = Math.abs(balance);
    });
    summary.profit = summary.income - summary.expense;
    return summary;
  }
};
