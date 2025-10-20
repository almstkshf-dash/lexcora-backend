const rolesService = require("../services/rolesService");

const getAllRoles = async (req, res) => {
  try {
    const roles = await rolesService.listRoles();
    res.status(200).json({
      success: true,
      data: roles
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching roles",
      error: error.message
    });
  }
};

const getRoleById = async (req, res) => {
  try {
    const { id } = req.params;
    const role = await rolesService.getRole(id);
    res.status(200).json({
      success: true,
      data: role
    });
  } catch (error) {
    const status = error.message === "Role not found" ? 404 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

const createRole = async (req, res) => {
  try {
    const roleData = req.body;
    const newRole = await rolesService.addRole(roleData);
    res.status(201).json({
      success: true,
      message: "Role created successfully",
      data: newRole
    });
  } catch (error) {
    const status = error.message.includes("already exists") || 
                   error.message.includes("Missing required fields") ||
                   error.message.includes("must be") ||
                   error.message.includes("cannot be empty") ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

const updateRole = async (req, res) => {
  try {
    const { id } = req.params;
    const roleData = req.body;
    const updatedRole = await rolesService.updateRole(id, roleData);
    res.status(200).json({
      success: true,
      message: "Role updated successfully",
      data: updatedRole
    });
  } catch (error) {
    const status = error.message === "Role not found" ? 404 :
                   error.message.includes("already exists") ||
                   error.message.includes("must be") ? 400 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

const deleteRole = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await rolesService.removeRole(id);
    res.status(200).json({
      success: true,
      message: result.message
    });
  } catch (error) {
    const status = error.message === "Role not found" ? 404 :
                   error.message.includes("Cannot delete role that is assigned to users") ? 409 : 500;
    res.status(status).json({
      success: false,
      message: error.message
    });
  }
};

const getRolesWithUsage = async (req, res) => {
  try {
    const rolesWithUsage = await rolesService.getRolesWithUsageCount();
    res.status(200).json({
      success: true,
      data: rolesWithUsage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching roles with usage count",
      error: error.message
    });
  }
};

module.exports = {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  getRolesWithUsage
};