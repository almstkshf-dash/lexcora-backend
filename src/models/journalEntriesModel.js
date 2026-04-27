const db = require("../config/db");

const getAllJournalEntries = async (filters = {}) => {
  const { start_date, end_date, status, branch_id } = filters;
  let query = `
    SELECT je.*, c.name_en as currency_name, e.name as creator_name, b.name_en as branch_name
    FROM journal_entries je
    LEFT JOIN currencies c ON je.currency_code = c.code
    LEFT JOIN employees e ON je.created_by = e.id
    LEFT JOIN branches b ON je.branch_id = b.id
    WHERE 1=1
  `;
  const params = [];

  if (start_date) {
    query += " AND je.entry_date >= ?";
    params.push(start_date);
  }
  if (end_date) {
    query += " AND je.entry_date <= ?";
    params.push(end_date);
  }
  if (status) {
    query += " AND je.status = ?";
    params.push(status);
  }
  if (branch_id) {
    query += " AND je.branch_id = ?";
    params.push(branch_id);
  }

  query += " ORDER BY je.entry_date DESC, je.id DESC";

  try {
    const [rows] = await db.query(query, params);
    return { success: true, data: rows };
  } catch (error) {
    console.error("Error fetching journal entries:", error);
    throw error;
  }
};

const getJournalEntryById = async (id) => {
  try {
    const [entries] = await db.query(`
      SELECT je.*, c.name_en as currency_name, e.name as creator_name
      FROM journal_entries je
      LEFT JOIN currencies c ON je.currency_code = c.code
      LEFT JOIN employees e ON je.created_by = e.id
      WHERE je.id = ?
    `, [id]);

    if (entries.length === 0) return { success: false, message: "Journal entry not found" };

    const [items] = await db.query(`
      SELECT le.*, a.code as account_code, a.name_en as account_name, p.name as party_name, emp.name as employee_name
      FROM ledger_entries le
      JOIN accounts a ON le.account_id = a.id
      LEFT JOIN parties p ON le.party_id = p.id
      LEFT JOIN employees emp ON le.employee_id = emp.id
      WHERE le.journal_entry_id = ?
    `, [id]);

    return { 
      success: true, 
      data: {
        ...entries[0],
        items
      }
    };
  } catch (error) {
    console.error("Error fetching journal entry by id:", error);
    throw error;
  }
};

const createJournalEntry = async (entryData, items, existingConnection = null) => {
  const connection = existingConnection || await db.getConnection();
  let shouldRelease = !existingConnection;
  
  try {
    if (!existingConnection) await connection.beginTransaction();

    const { entry_date, reference_number, description, currency_code, exchange_rate, status, created_by, branch_id } = entryData;

    // 1. Insert Header
    const [entryResult] = await connection.query(
      `INSERT INTO journal_entries 
      (entry_date, reference_number, description, currency_code, exchange_rate, status, created_by, branch_id) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [entry_date, reference_number || null, description, currency_code || 'AED', exchange_rate || 1.0, status || 'draft', created_by, branch_id]
    );

    const journalEntryId = entryResult.insertId;

    // 2. Insert Items
    if (items && items.length > 0) {
      const itemValues = items.map(item => [
        journalEntryId,
        item.account_id,
        item.party_id || null,
        item.employee_id || null,
        item.description || description,
        item.debit || 0,
        (item.debit || 0) * (exchange_rate || 1.0), // base_debit
        item.credit || 0,
        (item.credit || 0) * (exchange_rate || 1.0), // base_credit
        item.branch_id || branch_id
      ]);

      await connection.query(
        `INSERT INTO ledger_entries 
        (journal_entry_id, account_id, party_id, employee_id, description, debit, base_debit, credit, base_credit, branch_id) 
        VALUES ?`,
        [itemValues]
      );
    }

    if (!existingConnection) await connection.commit();
    return { success: true, data: { id: journalEntryId } };
  } catch (error) {
    if (!existingConnection) await connection.rollback();
    console.error("Error creating journal entry:", error);
    throw error;
  } finally {
    if (shouldRelease) connection.release();
  }
};

const updateJournalStatus = async (id, status) => {
  try {
    const [result] = await db.query("UPDATE journal_entries SET status = ? WHERE id = ?", [status, id]);
    return { success: true, affectedRows: result.affectedRows };
  } catch (error) {
    console.error("Error updating journal status:", error);
    throw error;
  }
};

const getTrialBalance = async (filters = {}) => {
    const { start_date, end_date, branch_id, consolidate = false } = filters;
    
    // If consolidated, we use base_debit/base_credit (system currency)
    // If not consolidated, we use debit/credit (which might be in different currencies if not careful, 
    // but usually trial balance is per branch in base currency anyway)
    const debitCol = consolidate ? 'le.base_debit' : 'le.debit';
    const creditCol = consolidate ? 'le.base_credit' : 'le.credit';

    let query = `
      SELECT 
        a.id as account_id,
        a.code,
        a.name_en,
        a.name_ar,
        a.type,
        SUM(${debitCol}) as total_debit,
        SUM(${creditCol}) as total_credit,
        (SUM(${debitCol}) - SUM(${creditCol})) as balance
      FROM accounts a
      LEFT JOIN ledger_entries le ON a.id = le.account_id
      LEFT JOIN journal_entries je ON le.journal_entry_id = je.id
      WHERE je.status = 'posted'
    `;
    const params = [];

    if (start_date) {
      query += " AND je.entry_date >= ?";
      params.push(start_date);
    }
    if (end_date) {
      query += " AND je.entry_date <= ?";
      params.push(end_date);
    }
    
    // If consolidate is false and branch_id is provided, filter by branch
    if (!consolidate && branch_id) {
      query += " AND je.branch_id = ?";
      params.push(branch_id);
    }

    query += " GROUP BY a.id, a.code, a.name_en, a.name_ar, a.type ORDER BY a.code ASC";

    try {
      const [rows] = await db.query(query, params);
      return { success: true, data: rows };
    } catch (error) {
      console.error("Error fetching trial balance:", error);
      throw error;
    }
};

module.exports = {
  getAllJournalEntries,
  getJournalEntryById,
  createJournalEntry,
  updateJournalStatus,
  getTrialBalance
};
