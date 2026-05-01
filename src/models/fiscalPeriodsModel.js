const db = require("../config/db");

const getAllPeriods = async (filters = {}) => {
  const { branch_id, status } = filters;
  let query = "SELECT * FROM fiscal_periods WHERE 1=1";
  const params = [];

  if (branch_id) {
    query += " AND branch_id = ?";
    params.push(branch_id);
  }
  if (status) {
    query += " AND status = ?";
    params.push(status);
  }

  query += " ORDER BY start_date DESC";

  try {
    const [rows] = await db.query(query, params);
    return { success: true, data: rows };
  } catch (error) {
    console.error("Error fetching fiscal periods:", error);
    throw error;
  }
};

const createPeriod = async (periodData) => {
  const { name, start_date, end_date, branch_id, created_by } = periodData;
  try {
    const [result] = await db.query(
      "INSERT INTO fiscal_periods (name, start_date, end_date, branch_id, created_by) VALUES (?, ?, ?, ?, ?)",
      [name, start_date, end_date, branch_id || null, created_by]
    );
    return { success: true, data: { id: result.insertId } };
  } catch (error) {
    console.error("Error creating fiscal period:", error);
    throw error;
  }
};

const updatePeriodStatus = async (id, status) => {
  try {
    const [result] = await db.query("UPDATE fiscal_periods SET status = ? WHERE id = ?", [status, id]);
    return { success: true, affectedRows: result.affectedRows };
  } catch (error) {
    console.error("Error updating fiscal period status:", error);
    throw error;
  }
};

const isPeriodOpen = async (date, branch_id = null) => {
  let query = "SELECT id FROM fiscal_periods WHERE ? BETWEEN start_date AND end_date AND status = 'open'";
  const params = [date];
  
  if (branch_id) {
    query += " AND (branch_id = ? OR branch_id IS NULL)";
    params.push(branch_id);
  }

  const [rows] = await db.query(query, params);
  return rows.length > 0;
};

module.exports = {
  getAllPeriods,
  createPeriod,
  updatePeriodStatus,
  isPeriodOpen
};
