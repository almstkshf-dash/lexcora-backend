const permissionsModel = require("../models/permissionsModel");

// List all permissions
const listPermissions = async () => {
  try {
    const permissions = await permissionsModel.getAllPermissions();
    return permissions;
  } catch (error) {
    throw new Error(`Failed to fetch permissions: ${error.message}`);
  }
};

// Get permission by ID
const getPermission = async (id) => {
  try {
    const permission = await permissionsModel.getPermissionById(id);
    if (!permission) {
      throw new Error("Permission not found");
    }
    return permission;
  } catch (error) {
    throw new Error(`Failed to fetch permission: ${error.message}`);
  }
};

// Create new permission
const addPermission = async (permissionData) => {
  try {
    const { permissionAr, permissionEn, permissionGroupName, permissionParentName } = permissionData;
    
    // Validate required fields
    if (!permissionAr || !permissionEn) {
      throw new Error("Both Arabic and English permission names are required");
    }
    
    // Validate minimum length
    if (permissionAr.trim().length < 2 || permissionEn.trim().length < 2) {
      throw new Error("Permission names must be at least 2 characters long");
    }
    
    // Check if permission already exists
    const existingPermission = await permissionsModel.permissionExists(
      permissionAr.trim(), 
      permissionEn.trim()
    );
    
    if (existingPermission) {
      throw new Error("Permission with this name already exists");
    }
    
    // Create permission
    const permissionId = await permissionsModel.createPermission({
      permissionAr: permissionAr.trim(),
      permissionEn: permissionEn.trim(),
      permissionGroupName: permissionGroupName !== undefined ? (permissionGroupName === null ? null : String(permissionGroupName).trim()) : undefined,
      permissionParentName: permissionParentName !== undefined ? (permissionParentName === null ? null : String(permissionParentName).trim()) : undefined,
    });
    
    return permissionId;
  } catch (error) {
    throw new Error(`Failed to create permission: ${error.message}`);
  }
};

// Update permission
const updatePermission = async (id, permissionData) => {
  try {
    const { permissionAr, permissionEn, permissionGroupName, permissionParentName } = permissionData;
    
    // Check if permission exists
    const existingPermission = await permissionsModel.getPermissionById(id);
    if (!existingPermission) {
      throw new Error("Permission not found");
    }
    
    // Validate required fields
    if (!permissionAr || !permissionEn) {
      throw new Error("Both Arabic and English permission names are required");
    }
    
    // Validate minimum length
    if (permissionAr.trim().length < 2 || permissionEn.trim().length < 2) {
      throw new Error("Permission names must be at least 2 characters long");
    }
    
    // Check if another permission with the same name exists (excluding current one)
    const duplicatePermission = await permissionsModel.permissionExists(
      permissionAr.trim(), 
      permissionEn.trim(),
      id
    );
    
    if (duplicatePermission) {
      throw new Error("Another permission with this name already exists");
    }
    
    // Update permission
    const success = await permissionsModel.updatePermission(id, {
      permissionAr: permissionAr.trim(),
      permissionEn: permissionEn.trim(),
      permissionGroupName: permissionGroupName !== undefined ? (permissionGroupName === null ? null : String(permissionGroupName).trim()) : undefined,
      permissionParentName: permissionParentName !== undefined ? (permissionParentName === null ? null : String(permissionParentName).trim()) : undefined,
    });
    
    if (!success) {
      throw new Error("Failed to update permission");
    }
    
    return true;
  } catch (error) {
    throw new Error(`Failed to update permission: ${error.message}`);
  }
};

// Delete permission
const deletePermission = async (id) => {
  try {
    // Check if permission exists
    const existingPermission = await permissionsModel.getPermissionById(id);
    if (!existingPermission) {
      throw new Error("Permission not found");
    }
    
    // TODO: Add check for permissions in use by employees/roles
    // This would require checking employee_permissions table or similar
    
    const success = await permissionsModel.deletePermission(id);
    if (!success) {
      throw new Error("Failed to delete permission");
    }
    
    return { message: "Permission deleted successfully" };
  } catch (error) {
    throw new Error(`Failed to delete permission: ${error.message}`);
  }
};

// Search permissions
const searchPermissions = async (searchTerm) => {
  try {
    if (!searchTerm || searchTerm.trim().length < 1) {
      throw new Error("Search term is required");
    }
    
    const permissions = await permissionsModel.searchPermissions(searchTerm.trim());
    return permissions;
  } catch (error) {
    throw new Error(`Failed to search permissions: ${error.message}`);
  }
};

// Get permissions with pagination
const getPermissionsWithPagination = async (page = 1, limit = 10) => {
  try {
    // Validate pagination parameters
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    
    if (pageNum < 1) {
      throw new Error("Page number must be greater than 0");
    }
    
    if (limitNum < 1 || limitNum > 100) {
      throw new Error("Limit must be between 1 and 100");
    }
    
    const result = await permissionsModel.getPermissionsWithPagination(pageNum, limitNum);
    return result;
  } catch (error) {
    throw new Error(`Failed to fetch paginated permissions: ${error.message}`);
  }
};

// Get permission by name (useful for checking permissions)
const getPermissionByName = async (name) => {
  try {
    if (!name || name.trim().length < 1) {
      throw new Error("Permission name is required");
    }
    
    const permission = await permissionsModel.getPermissionByName(name.trim());
    if (!permission) {
      throw new Error("Permission not found");
    }
    
    return permission;
  } catch (error) {
    throw new Error(`Failed to fetch permission by name: ${error.message}`);
  }
};
    
// Bulk create permissions (useful for seeding)
const bulkCreatePermissions = async (permissionsArray) => {
  try {
    if (!Array.isArray(permissionsArray) || permissionsArray.length === 0) {
      throw new Error("Array of permissions is required");
    }
    
    const results = [];
    const errors = [];
    
    for (const permissionData of permissionsArray) {
      try {
        const permissionId = await addPermission(permissionData);
        results.push({
          success: true,
          permission_ar: permissionData.permissionAr,
          permission_en: permissionData.permissionEn,
          permission_group_name: permissionData.permissionGroupName,
          permission_parent_name: permissionData.permissionParentName,
          id: permissionId
        });
      } catch (error) {
        errors.push({
          success: false,
          permission_ar: permissionData.permissionAr,
          permission_en: permissionData.permissionEn,
          permission_group_name: permissionData.permissionGroupName,
          permission_parent_name: permissionData.permissionParentName,
          error: error.message
        });
      }
    }
    
    return {
      successful: results,
      failed: errors,
      summary: {
        total: permissionsArray.length,
        successful: results.length,
        failed: errors.length
      }
    };
  } catch (error) {
    throw new Error(`Failed to bulk create permissions: ${error.message}`);
  }
};

// Get employee permissions (all permissions with assignment status)
const getEmployeePermissions = async (employeeId) => {
  try {
    if (!employeeId || isNaN(employeeId)) {
      throw new Error("Valid employee ID is required");
    }
    
    const permissions = await permissionsModel.getEmployeePermissions(employeeId);
    return permissions;
  } catch (error) {
    throw new Error(`Failed to fetch employee permissions: ${error.message}`);
  }
};

// Update employee permissions (delete all existing and add new ones)
const updateEmployeePermissions = async (employeeId, permissionIds) => {
  try {
    if (!employeeId || isNaN(employeeId)) {
      throw new Error("Valid employee ID is required");
    }

    if (!Array.isArray(permissionIds)) {
      throw new Error("Permission IDs must be an array");
    }

    // Validate that all permission IDs are numbers
    for (const permissionId of permissionIds) {
      if (!permissionId || isNaN(permissionId)) {
        throw new Error("All permission IDs must be valid numbers");
      }
    }

    // First, delete all existing permissions for the employee
    await permissionsModel.deleteEmployeePermissions(employeeId);

    // Then, add the new permissions
    for (const permissionId of permissionIds) {
      await permissionsModel.addEmployeePermission(employeeId, permissionId);
    }

    return { message: "Employee permissions updated successfully" };
  } catch (error) {
    throw new Error(`Failed to update employee permissions: ${error.message}`);
  }
};

module.exports = {
  listPermissions,
  getPermission,
  addPermission,
  updatePermission,
  deletePermission,
  searchPermissions,
  getPermissionsWithPagination,
  getPermissionByName,
  bulkCreatePermissions,
  getEmployeePermissions,
  updateEmployeePermissions,
};