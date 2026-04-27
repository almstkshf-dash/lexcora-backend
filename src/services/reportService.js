const db = require("../config/db");

/**
 * Calculates aging analysis for Receivables or Payables.
 * @param {string} type 'AR' for Receivables, 'AP' for Payables
 */
const getAgingAnalysis = async (type = 'AR') => {
  const accountCode = type === 'AR' ? '1103' : '2101'; // 1103: AR, 2101: AP
  
  // SQL to calculate aging based on journal entries and ledger items linked to parties
  const query = `
    SELECT 
      p.id as party_id,
      p.name as party_name,
      SUM(CASE WHEN DATEDIFF(CURDATE(), je.entry_date) <= 30 THEN (le.debit - le.credit) ELSE 0 END) as '0-30',
      SUM(CASE WHEN DATEDIFF(CURDATE(), je.entry_date) BETWEEN 31 AND 60 THEN (le.debit - le.credit) ELSE 0 END) as '31-60',
      SUM(CASE WHEN DATEDIFF(CURDATE(), je.entry_date) BETWEEN 61 AND 90 THEN (le.debit - le.credit) ELSE 0 END) as '61-90',
      SUM(CASE WHEN DATEDIFF(CURDATE(), je.entry_date) > 90 THEN (le.debit - le.credit) ELSE 0 END) as '90+',
      SUM(le.debit - le.credit) as total_balance
    FROM parties p
    JOIN ledger_entries le ON p.id = le.party_id
    JOIN accounts a ON le.account_id = a.id
    JOIN journal_entries je ON le.journal_entry_id = je.id
    WHERE a.code = ? AND je.status = 'posted'
    GROUP BY p.id, p.name
    HAVING total_balance != 0
    ORDER BY total_balance DESC
  `;

  try {
    const [rows] = await db.query(query, [accountCode]);
    
    // For AP, the balance is naturally credit (negative in this calculation), so we multiply by -1 for readability
    const formattedRows = type === 'AP' ? rows.map(r => ({
      ...r,
      '0-30': r['0-30'] * -1,
      '31-60': r['31-60'] * -1,
      '61-90': r['61-90'] * -1,
      '90+': r['90+'] * -1,
      total_balance: r.total_balance * -1
    })) : rows;

    return { success: true, data: formattedRows };
  } catch (error) {
    console.error(`Error calculating ${type} aging:`, error);
    throw error;
  }
};

module.exports = {
  getAgingAnalysis
};
