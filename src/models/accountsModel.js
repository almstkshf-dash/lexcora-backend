const db = require("../config/db");

const getAllAccounts = async (filters = {}) => {
  const { type, is_active, branch_id } = filters;
  let query = "SELECT * FROM accounts WHERE 1=1";
  const params = [];

  if (type) {
    query += " AND type = ?";
    params.push(type);
  }
  if (is_active !== undefined) {
    query += " AND is_active = ?";
    params.push(is_active);
  }
  if (branch_id) {
    query += " AND (branch_id = ? OR branch_id IS NULL)";
    params.push(branch_id);
  }

  query += " ORDER BY code ASC";

  try {
    const [rows] = await db.query(query, params);
    return { success: true, data: rows };
  } catch (error) {
    console.error("Error fetching accounts:", error);
    throw error;
  }
};

const getAccountById = async (id) => {
  try {
    const [rows] = await db.query("SELECT * FROM accounts WHERE id = ?", [id]);
    if (rows.length === 0) return { success: false, message: "Account not found" };
    return { success: true, data: rows[0] };
  } catch (error) {
    console.error("Error fetching account by id:", error);
    throw error;
  }
};

const createAccount = async (accountData) => {
  const { code, name_ar, name_en, type, parent_id, branch_id } = accountData;
  try {
    const [result] = await db.query(
      "INSERT INTO accounts (code, name_ar, name_en, type, parent_id, branch_id) VALUES (?, ?, ?, ?, ?, ?)",
      [code, name_ar, name_en, type, parent_id || null, branch_id || null]
    );
    return { success: true, data: { id: result.insertId } };
  } catch (error) {
    console.error("Error creating account:", error);
    throw error;
  }
};

const updateAccount = async (id, accountData) => {
  const fields = [];
  const params = [];
  
  Object.keys(accountData).forEach(key => {
    if (['code', 'name_ar', 'name_en', 'type', 'parent_id', 'branch_id', 'is_active'].includes(key)) {
      fields.push(`${key} = ?`);
      params.push(accountData[key]);
    }
  });

  if (fields.length === 0) return { success: false, message: "No fields to update" };

  params.push(id);
  try {
    const [result] = await db.query(`UPDATE accounts SET ${fields.join(", ")} WHERE id = ?`, params);
    return { success: true, affectedRows: result.affectedRows };
  } catch (error) {
    console.error("Error updating account:", error);
    throw error;
  }
};

const deleteAccount = async (id) => {
  try {
    const [result] = await db.query("DELETE FROM accounts WHERE id = ?", [id]);
    return { success: true, affectedRows: result.affectedRows };
  } catch (error) {
    console.error("Error deleting account:", error);
    throw error;
  }
};

module.exports = {
  getAllAccounts,
  getAccountById,
  createAccount,
  updateAccount,
  deleteAccount
};
