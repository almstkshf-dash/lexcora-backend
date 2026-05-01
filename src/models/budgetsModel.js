const db = require("../config/db");

const setBudget = async (budgetData) => {
  const { account_id, amount, fiscal_year, fiscal_month, branch_id, created_by } = budgetData;
  try {
    // Check if budget already exists for this account/year/month
    const [existing] = await db.query(
      "SELECT id FROM account_budgets WHERE account_id = ? AND fiscal_year = ? AND COALESCE(fiscal_month, 0) = ?",
      [account_id, fiscal_year, fiscal_month || 0]
    );

    if (existing.length > 0) {
      await db.query(
        "UPDATE account_budgets SET amount = ?, branch_id = ? WHERE id = ?",
        [amount, branch_id || null, existing[0].id]
      );
      return { success: true, message: "Budget updated", id: existing[0].id };
    } else {
      const [result] = await db.query(
        "INSERT INTO account_budgets (account_id, amount, fiscal_year, fiscal_month, branch_id, created_by) VALUES (?, ?, ?, ?, ?, ?)",
        [account_id, amount, fiscal_year, fiscal_month || null, branch_id || null, created_by]
      );
      return { success: true, id: result.insertId };
    }
  } catch (error) {
    console.error("Error setting budget:", error);
    throw error;
  }
};

const getBudgetVsActual = async (filters = {}) => {
  const { fiscal_year, fiscal_month, branch_id } = filters;
  
  let actualQuery = `
    SELECT account_id, SUM(base_debit - base_credit) as actual_amount
    FROM ledger_entries le
    JOIN journal_entries je ON le.journal_entry_id = je.id
    WHERE je.status = 'posted' AND YEAR(je.entry_date) = ?
  `;
  const actualParams = [fiscal_year];
  
  if (fiscal_month) {
    actualQuery += " AND MONTH(je.entry_date) = ?";
    actualParams.push(fiscal_month);
  }
  if (branch_id) {
    actualQuery += " AND je.branch_id = ?";
    actualParams.push(branch_id);
  }
  actualQuery += " GROUP BY account_id";

  let budgetQuery = `
    SELECT ab.*, a.code, a.name_en, a.name_ar, a.type
    FROM account_budgets ab
    JOIN accounts a ON ab.account_id = a.id
    WHERE ab.fiscal_year = ?
  `;
  const budgetParams = [fiscal_year];
  if (fiscal_month) {
    budgetQuery += " AND ab.fiscal_month = ?";
    budgetParams.push(fiscal_month);
  } else {
    budgetQuery += " AND ab.fiscal_month IS NULL";
  }
  if (branch_id) {
    budgetQuery += " AND ab.branch_id = ?";
    budgetParams.push(branch_id);
  }

  try {
    const [budgets] = await db.query(budgetQuery, budgetParams);
    const [actuals] = await db.query(actualQuery, actualParams);
    
    const actualMap = {};
    actuals.forEach(a => actualMap[a.account_id] = parseFloat(a.actual_amount));

    const report = budgets.map(b => {
      const actual = actualMap[b.account_id] || 0;
      // For revenue, actual is usually negative in balance (credit), so we adjust for comparison
      const adjustedActual = (b.type === 'revenue') ? actual * -1 : actual;
      return {
        ...b,
        actual_amount: adjustedActual,
        variance: b.amount - adjustedActual,
        performance_pct: b.amount > 0 ? (adjustedActual / b.amount) * 100 : 0
      };
    });

    return { success: true, data: report };
  } catch (error) {
    console.error("Error fetching budget vs actual:", error);
    throw error;
  }
};

module.exports = {
  setBudget,
  getBudgetVsActual
};
