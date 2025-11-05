const db = require("../config/db");

// Get all permissions
const getAllPermissions = async () => {
  const [rows] = await db.query(`
    SELECT 
      id,
      permission_ar,
      permission_en,
      permission_group_name,
      permission_parent_name
    FROM permissions
    ORDER BY permission_en ASC
  `);
  return rows;
};

// Get permission by ID
const getPermissionById = async (id) => {
  const [rows] = await db.query(`
    SELECT 
      id,
      permission_ar,
      permission_en,
      permission_group_name,
      permission_parent_name,
      created_at,
      updated_at
    FROM permissions 
    WHERE id = ?
  `, [id]);
  
  if (rows.length === 0) return null;
  return rows[0];
};

// Get permission by name (either Arabic or English)
const getPermissionByName = async (name) => {
  const [rows] = await db.query(`
    SELECT 
      id,
      permission_ar,
      permission_en,
      permission_group_name,
      permission_parent_name,
      created_at,
      updated_at
    FROM permissions 
    WHERE permission_ar = ? OR permission_en = ?
  `, [name, name]);
  
  if (rows.length === 0) return null;
  return rows[0];
};

// Create new permission
const createPermission = async (permissionData) => {
  const { permissionAr, permissionEn, permissionGroupName = null, permissionParentName = null } = permissionData;

  // Build dynamic insert to keep backward compatibility
  const columns = ['permission_ar', 'permission_en'];
  const values = [permissionAr, permissionEn];
  if (permissionGroupName !== undefined) {
    columns.push('permission_group_name');
    values.push(permissionGroupName);
  }
  if (permissionParentName !== undefined) {
    columns.push('permission_parent_name');
    values.push(permissionParentName);
  }

  const placeholders = columns.map(() => '?').join(', ');
  const sql = `INSERT INTO permissions (${columns.join(', ')}) VALUES (${placeholders})`;

  const [result] = await db.query(sql, values);
  return result.insertId;
};

// Update permission
const updatePermission = async (id, permissionData) => {
  const { permissionAr, permissionEn, permissionGroupName = undefined, permissionParentName = undefined } = permissionData;

  // Use COALESCE to keep existing values when optional fields are not provided
  const [result] = await db.query(`
    UPDATE permissions 
    SET 
      permission_ar = ?, 
      permission_en = ?,
      permission_group_name = COALESCE(?, permission_group_name),
      permission_parent_name = COALESCE(?, permission_parent_name)
    WHERE id = ?
  `, [permissionAr, permissionEn, permissionGroupName, permissionParentName, id]);
  
  return result.affectedRows > 0;
};

// Delete permission
const deletePermission = async (id) => {
  const [result] = await db.query(
    "DELETE FROM permissions WHERE id = ?", 
    [id]
  );
  return result.affectedRows > 0;
};

// Search permissions by text (both Arabic and English)
const searchPermissions = async (searchTerm) => {
  const searchPattern = `%${searchTerm}%`;
  
  const [rows] = await db.query(`
    SELECT 
      id,
      permission_ar,
      permission_en,
      permission_group_name,
      permission_parent_name,
      created_at,
      updated_at
    FROM permissions 
    WHERE permission_ar LIKE ? OR permission_en LIKE ?
    ORDER BY permission_en ASC
  `, [searchPattern, searchPattern]);
  
  return rows;
};

// Check if permission exists by name
const permissionExists = async (permissionAr, permissionEn, excludeId = null) => {
  let query = `
    SELECT COUNT(*) as count 
    FROM permissions 
    WHERE (permission_ar = ? OR permission_en = ?)
  `;
  
  const params = [permissionAr, permissionEn];
  
  if (excludeId) {
    query += ` AND id != ?`;
    params.push(excludeId);
  }
  
  const [rows] = await db.query(query, params);
  return rows[0].count > 0;
};
const getEmployeePermissions = async (employeeId) => {
  const [rows] = await db.query(`
    SELECT 
      p.id,
      p.permission_ar, 
      p.permission_en,
      p.permission_group_name,
      p.permission_parent_name,
      CASE 
        WHEN ep.employee_id IS NOT NULL THEN true 
        ELSE false 
      END as isPermissionForThisUser
    FROM permissions p
    LEFT JOIN employee_permissions ep ON p.id = ep.permission_id AND ep.employee_id = ?
    ORDER BY p.permission_en ASC
  `, [employeeId]);
  return rows;
};

const addEmployeePermission = async (employeeId, permissionId) => {
  const [result] = await db.query(`
    INSERT INTO employee_permissions (employee_id, permission_id)
    VALUES (?, ?)
  `, [employeeId, permissionId]);
    return result.affectedRows > 0;
};

const deleteEmployeePermissions = async (employeeId) => {
  const [result] = await db.query(`
    DELETE FROM employee_permissions 
    WHERE employee_id = ?
  `, [employeeId]);
  return result.affectedRows >= 0; // Return true even if no rows were deleted
};

// Get permissions with pagination
const getPermissionsWithPagination = async (page = 1, limit = 10) => {
  const offset = (page - 1) * limit;
  
  // Get total count
  const [countResult] = await db.query(`
    SELECT COUNT(*) as total FROM permissions
  `);
  
  // Get paginated results
  const [rows] = await db.query(`
    SELECT 
      id,
      permission_ar,
      permission_en,
      created_at,
      updated_at
    FROM permissions
    ORDER BY permission_en ASC
    LIMIT ? OFFSET ?
  `, [parseInt(limit), parseInt(offset)]);
  
  return {
    permissions: rows,
    pagination: {
      current_page: parseInt(page),
      per_page: parseInt(limit),
      total: countResult[0].total,
      total_pages: Math.ceil(countResult[0].total / limit)
    }
  };
};


module.exports = {
  getAllPermissions,
  getPermissionById,
  getPermissionByName,
  createPermission,
  updatePermission,
  deletePermission,
  searchPermissions,
  permissionExists,
  getPermissionsWithPagination,
  getEmployeePermissions,
  addEmployeePermission,
  deleteEmployeePermissions
};