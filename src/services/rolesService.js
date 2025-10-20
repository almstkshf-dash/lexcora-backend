const rolesModel = require("../models/rolesModel");

const listRoles = async () => {
  return await rolesModel.getAllRoles();
};

const getRole = async (id) => {
  const role = await rolesModel.getRoleById(id);
  if (!role) {
    throw new Error("Role not found");
  }
  return role;
};

const getRoleByName = async (role_ar, role_en) => {
  const role = await rolesModel.getRoleByName(role_ar, role_en);
  if (!role) {
    throw new Error("Role not found");
  }
  return role;
};

const addRole = async (data) => {
  // Validation
  if (!data.role_ar || !data.role_en) {
    throw new Error("Missing required fields: role_ar, role_en");
  }

  // Validate role names are strings and not empty
  if (typeof data.role_ar !== 'string' || typeof data.role_en !== 'string') {
    throw new Error("role_ar and role_en must be strings");
  }

  if (data.role_ar.trim().length === 0 || data.role_en.trim().length === 0) {
    throw new Error("role_ar and role_en cannot be empty");
  }

  // Validate role names length
  if (data.role_ar.length > 100 || data.role_en.length > 100) {
    throw new Error("Role names must be 100 characters or less");
  }

  // Check if role name already exists
  const roleExists = await rolesModel.checkRoleNameExists(data.role_ar.trim(), data.role_en.trim());
  if (roleExists) {
    throw new Error("Role name already exists (Arabic or English)");
  }

  const roleData = {
    role_ar: data.role_ar.trim(),
    role_en: data.role_en.trim()
  };

  const roleId = await rolesModel.createRole(roleData);
  return await getRole(roleId);
};

const updateRole = async (id, data) => {
  // Check if role exists
  const existingRole = await rolesModel.getRoleById(id);
  if (!existingRole) {
    throw new Error("Role not found");
  }

  // Validate role names if provided
  if (data.role_ar !== undefined) {
    if (typeof data.role_ar !== 'string' || data.role_ar.trim().length === 0) {
      throw new Error("role_ar must be a non-empty string");
    }
    if (data.role_ar.length > 100) {
      throw new Error("role_ar must be 100 characters or less");
    }
    data.role_ar = data.role_ar.trim();
  }

  if (data.role_en !== undefined) {
    if (typeof data.role_en !== 'string' || data.role_en.trim().length === 0) {
      throw new Error("role_en must be a non-empty string");
    }
    if (data.role_en.length > 100) {
      throw new Error("role_en must be 100 characters or less");
    }
    data.role_en = data.role_en.trim();
  }

  // Check if role name already exists (excluding current role)
  if (data.role_ar || data.role_en) {
    const checkRoleAr = data.role_ar || existingRole.role_ar;
    const checkRoleEn = data.role_en || existingRole.role_en;
    
    const roleExists = await rolesModel.checkRoleNameExists(checkRoleAr, checkRoleEn, id);
    if (roleExists) {
      throw new Error("Role name already exists (Arabic or English)");
    }
  }

  const updated = await rolesModel.updateRole(id, data);
  if (!updated) {
    throw new Error("Failed to update role");
  }

  return await getRole(id);
};

const removeRole = async (id) => {
  // Check if role exists
  const existingRole = await rolesModel.getRoleById(id);
  if (!existingRole) {
    throw new Error("Role not found");
  }

  try {
    const deleted = await rolesModel.deleteRole(id);
    if (!deleted) {
      throw new Error("Failed to delete role");
    }

    return { message: "Role deleted successfully" };
  } catch (error) {
    if (error.message.includes("Cannot delete role that is assigned to users")) {
      throw new Error("Cannot delete role that is assigned to users");
    }
    throw error;
  }
};

const getRolesWithUsageCount = async () => {
  return await rolesModel.getRolesUsageCount();
};

const validateRoleId = async (roleId) => {
  const role = await rolesModel.getRoleById(roleId);
  return role !== null;
};

module.exports = {
  listRoles,
  getRole,
  getRoleByName,
  addRole,
  updateRole,
  removeRole,
  getRolesWithUsageCount,
  validateRoleId
};