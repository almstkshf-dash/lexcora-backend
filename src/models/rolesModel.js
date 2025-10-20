const db = require("../config/db");

const getAllRoles = async () => {
  const [rows] = await db.query(`
    SELECT id, role_ar, role_en
    FROM roles
    
  `);
  
  return rows;
};

const getRoleById = async (id) => {
  const [rows] = await db.query(`
    SELECT id, role_ar, role_en
    FROM roles 
    WHERE id = ?
  `, [id]);
  
  return rows.length > 0 ? rows[0] : null;
};





const getRoleByName = async (role_ar, role_en) => {
  const [rows] = await db.query(`
    SELECT id, role_ar, role_en, created_at, updated_at
    FROM roles 
    WHERE role_ar = ? OR role_en = ?
  `, [role_ar, role_en]);
  
  return rows.length > 0 ? rows[0] : null;
};

const createRole = async (role) => {
  const {
    role_ar,
    role_en
  } = role;

  const [result] = await db.query(
    `INSERT INTO roles (role_ar, role_en, created_at, updated_at) 
     VALUES (?, ?, NOW(), NOW())`,
    [role_ar, role_en]
  );

  return result.insertId;
};

const updateRole = async (id, role) => {
  const {
    role_ar,
    role_en
  } = role;

  let query = `UPDATE roles SET `;
  const params = [];
  const updates = [];

  if (role_ar !== undefined) {
    updates.push(`role_ar = ?`);
    params.push(role_ar);
  }
  if (role_en !== undefined) {
    updates.push(`role_en = ?`);
    params.push(role_en);
  }

  if (updates.length === 0) {
    throw new Error("No fields to update");
  }

  updates.push(`updated_at = NOW()`);
  query += updates.join(", ") + ` WHERE id = ?`;
  params.push(id);

  const [result] = await db.query(query, params);
  return result.affectedRows > 0;
};

const deleteRole = async (id) => {
  // First check if role is being used by any users
  const [userRows] = await db.query(
    `SELECT COUNT(*) as count FROM users WHERE role_id = ?`,
    [id]
  );
  
  if (userRows[0].count > 0) {
    throw new Error("Cannot delete role that is assigned to users");
  }

  const [result] = await db.query(
    `DELETE FROM roles WHERE id = ?`,
    [id]
  );
  return result.affectedRows > 0;
};

const checkRoleNameExists = async (role_ar, role_en, excludeId = null) => {
  let query = `SELECT COUNT(*) as count FROM roles WHERE (role_ar = ? OR role_en = ?)`;
  const params = [role_ar, role_en];
  
  if (excludeId) {
    query += ` AND id != ?`;
    params.push(excludeId);
  }

  const [rows] = await db.query(query, params);
  return rows[0].count > 0;
};

const getRolesUsageCount = async () => {
  const [rows] = await db.query(`
    SELECT 
      r.id,
      r.role_ar,
      r.role_en,
      COUNT(u.id) as user_count
    FROM roles r
    LEFT JOIN users u ON r.id = u.role_id
    GROUP BY r.id, r.role_ar, r.role_en
    ORDER BY r.id ASC
  `);
  
  return rows;
};

module.exports = {
  getAllRoles,
  getRoleById,
  getRoleByName,
  createRole,
  updateRole,
  deleteRole,
  checkRoleNameExists,
  getRolesUsageCount
};