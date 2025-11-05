const permissionsService = require("../services/permissionsService");

// Get all permissions
const getPermissions = async (req, res) => {
  try {
    const permissions = await permissionsService.listPermissions();
    res.json({
      success: true,
      data: permissions,
      count: permissions.length
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get permissions with pagination
const getPermissionsPaginated = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const result = await permissionsService.getPermissionsWithPagination(page, limit);
    
    res.json({
      success: true,
      data: result.permissions,
      pagination: result.pagination
    });
  } catch (err) {
    const statusCode = err.message.includes("must be") ? 400 : 500;
    res.status(statusCode).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get permission by ID
const getPermission = async (req, res) => {
  try {
    const { id } = req.params;
    const permission = await permissionsService.getPermission(id);
    res.json({
      success: true,
      data: permission
    });
  } catch (err) {
    const statusCode = err.message === "Permission not found" ? 404 : 500;
    res.status(statusCode).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Create new permission
const createPermission = async (req, res) => {
  try {
    const { permissionAr, permissionEn, permissionGroupName, permissionParentName } = req.body;
    
    if (!permissionAr || !permissionEn) {
      return res.status(400).json({
        success: false,
        message: "Both Arabic and English permission names are required"
      });
    }

    const permissionId = await permissionsService.addPermission({
      permissionAr,
      permissionEn,
      permissionGroupName,
      permissionParentName,
    });
    
    const newPermission = await permissionsService.getPermission(permissionId);
    res.status(201).json({ 
      success: true,
      message: "Permission created successfully",
      data: newPermission
    });
  } catch (err) {
    const statusCode = err.message.includes("already exists") ? 409 : 
                     err.message.includes("required") || err.message.includes("must be") ? 400 : 500;
    res.status(statusCode).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Update permission
const updatePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const { permissionAr, permissionEn, permissionGroupName, permissionParentName } = req.body;
    
    if (!permissionAr || !permissionEn) {
      return res.status(400).json({
        success: false,
        message: "Both Arabic and English permission names are required"
      });
    }

    await permissionsService.updatePermission(id, {
      permissionAr,
      permissionEn,
      permissionGroupName,
      permissionParentName,
    });
    
    const updatedPermission = await permissionsService.getPermission(id);
    res.json({
      success: true,
      message: "Permission updated successfully",
      data: updatedPermission
    });
  } catch (err) {
    const statusCode = err.message === "Permission not found" ? 404 : 
                     err.message.includes("already exists") ? 409 : 
                     err.message.includes("required") || err.message.includes("must be") ? 400 : 500;
    res.status(statusCode).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Delete permission
const deletePermission = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await permissionsService.deletePermission(id);
    res.json({
      success: true,
      message: result.message
    });
  } catch (err) {
    const statusCode = err.message === "Permission not found" ? 404 : 500;
    res.status(statusCode).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Search permissions
const searchPermissions = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        message: "Search query parameter 'q' is required"
      });
    }

    const permissions = await permissionsService.searchPermissions(q);
    res.json({
      success: true,
      data: permissions,
      count: permissions.length,
      search_term: q
    });
  } catch (err) {
    const statusCode = err.message.includes("required") ? 400 : 500;
    res.status(statusCode).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get permission by name
const getPermissionByName = async (req, res) => {
  try {
    const { name } = req.params;
    const permission = await permissionsService.getPermissionByName(name);
    res.json({
      success: true,
      data: permission
    });
  } catch (err) {
    const statusCode = err.message === "Permission not found" ? 404 : 
                     err.message.includes("required") ? 400 : 500;
    res.status(statusCode).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Bulk create permissions
const bulkCreatePermissions = async (req, res) => {
  try {
    const { permissions } = req.body;
    
    if (!permissions || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: "Array of permissions is required"
      });
    }

    if (permissions.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one permission is required"
      });
    }

    const result = await permissionsService.bulkCreatePermissions(permissions);
    
    const statusCode = result.failed.length > 0 ? 207 : 201; // 207 = Multi-Status
    
    res.status(statusCode).json({
      success: true,
      message: `Processed ${permissions.length} permissions`,
      data: result
    });
  } catch (err) {
    const statusCode = err.message.includes("required") ? 400 : 500;
    res.status(statusCode).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get permissions statistics
const getPermissionsStats = async (req, res) => {
  try {
    const permissions = await permissionsService.listPermissions();
    
    const stats = {
      total_permissions: permissions.length,
      recent_permissions: permissions
        .filter(p => {
          const createdDate = new Date(p.created_at);
          const weekAgo = new Date();
          weekAgo.setDate(weekAgo.getDate() - 7);
          return createdDate >= weekAgo;
        }).length,
      permissions_by_first_letter: {}
    };
    
    // Group by first letter of English name
    permissions.forEach(permission => {
      const firstLetter = permission.permission_en.charAt(0).toUpperCase();
      if (!stats.permissions_by_first_letter[firstLetter]) {
        stats.permissions_by_first_letter[firstLetter] = 0;
      }
      stats.permissions_by_first_letter[firstLetter]++;
    });
    
    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    res.status(500).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Get employee permissions (all permissions with assignment status)
const getEmployeePermissions = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const permissions = await permissionsService.getEmployeePermissions(employeeId);
    res.json({
      success: true,
      data: permissions,
      count: permissions.length
    });
  } catch (err) {
    const statusCode = err.message.includes("Valid employee ID") ? 400 : 
                      err.message === "Employee not found" ? 404 : 500;
    res.status(statusCode).json({ 
      success: false,
      message: err.message 
    });
  }
};

// Update employee permissions (replace all with new set)
const updateEmployeePermissions = async (req, res) => {
  try {
    const { employeeId } = req.params;
    const { permissions } = req.body;
    
    const result = await permissionsService.updateEmployeePermissions(employeeId, permissions);
    res.json({
      success: true,
      message: result.message
    });
  } catch (err) {
    const statusCode = err.message.includes("Valid") || err.message.includes("must be") ? 400 : 500;
    res.status(statusCode).json({ 
      success: false,
      message: err.message 
    });
  }
};

module.exports = {
  getPermissions,
  getPermissionsPaginated,
  getPermission,
  createPermission,
  updatePermission,
  deletePermission,
  searchPermissions,
  getPermissionByName,
  bulkCreatePermissions,
  getPermissionsStats,
  getEmployeePermissions,
  updateEmployeePermissions,
};