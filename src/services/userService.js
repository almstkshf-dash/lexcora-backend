const { getEmployeeById } = require('../models/employeeModel');

/**
 * Get comprehensive user profile data
 * @param {number} userId - The user ID
 * @returns {object} - Structured user profile data
 */
const getUserProfile = async (userId) => {
  try {
    const user = await getEmployeeById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Structure the user data
    const structuredUserData = {
      user: {
        id: user.id,
        username: user.username,
        status: user.status || 'active',
        email: user.email,
        phone: user.phone,
        national_id: user.national_id,
        created_at: user.created_at,
        updated_at: user.updated_at
      },
      employee: {
        id: user.employee_id || user.id,
        name: user.name,
        position: user.position,
        branch_id: user.branch_id,
        department_id: user.department_id,
        direct_manager_id: user.direct_manager_id
      },
      role: {
        id: user.role_id,
        name_ar: user.role_ar,
        name_en: user.role_en
      },
      department: {
        name_ar: user.department_ar,
        name_en: user.department_en
      },
      manager: {
        name: user.managerName
      },
      permissions: getUserPermissions(user),
      session: {
        loginTime: new Date().toISOString(),
        lastActivity: new Date().toISOString()
      }
    };

    return {
      success: true,
      message: 'User profile retrieved successfully',
      data: structuredUserData
    };
  } catch (error) {
    throw new Error(`Error fetching user profile: ${error.message}`);
  }
};

/**
 * Get user permissions based on role
 * @param {object} user - User object
 * @returns {object} - User permissions
 */
const getUserPermissions = (user) => {
  const roleEn = user.role_en?.toLowerCase() || '';
  const roleAr = user.role_ar || '';

  return {
    // Basic permissions
    canAccessDashboard: true,
    canViewProfile: true,
    canChangePassword: true,
    
    // Case management permissions
    canViewCases: true,
    canCreateCases: roleEn.includes('lawyer') || roleEn.includes('admin') || roleEn.includes('manager'),
    canEditCases: roleEn.includes('lawyer') || roleEn.includes('admin') || roleEn.includes('manager'),
    canDeleteCases: roleEn.includes('admin'),
    canAssignCases: roleEn.includes('manager') || roleEn.includes('admin'),
    
    // Document management permissions
    canViewDocuments: true,
    canUploadDocuments: roleEn.includes('lawyer') || roleEn.includes('admin') || roleEn.includes('manager'),
    canDeleteDocuments: roleEn.includes('admin'),
    
    // Employee management permissions
    canViewEmployees: roleEn.includes('manager') || roleEn.includes('admin') || roleEn.includes('hr'),
    canCreateEmployees: roleEn.includes('admin') || roleEn.includes('hr'),
    canEditEmployees: roleEn.includes('admin') || roleEn.includes('hr'),
    canDeleteEmployees: roleEn.includes('admin'),
    
    // Client management permissions
    canViewClients: true,
    canCreateClients: roleEn.includes('lawyer') || roleEn.includes('admin') || roleEn.includes('manager'),
    canEditClients: roleEn.includes('lawyer') || roleEn.includes('admin') || roleEn.includes('manager'),
    canDeleteClients: roleEn.includes('admin'),
    
    // Court management permissions
    canViewCourts: true,
    canManageCourts: roleEn.includes('admin'),
    
    // Reports permissions
    canViewReports: roleEn.includes('manager') || roleEn.includes('admin'),
    canGenerateReports: roleEn.includes('manager') || roleEn.includes('admin'),
    
    // System administration permissions
    canManageSystem: roleEn.includes('admin'),
    canManageRoles: roleEn.includes('admin'),
    canManageDepartments: roleEn.includes('admin'),
    canViewLogs: roleEn.includes('admin') || roleEn.includes('manager'),
    
    // Task management permissions
    canViewTasks: true,
    canCreateTasks: roleEn.includes('lawyer') || roleEn.includes('admin') || roleEn.includes('manager'),
    canAssignTasks: roleEn.includes('manager') || roleEn.includes('admin'),
    canDeleteTasks: roleEn.includes('admin')
  };
};

/**
 * Update user profile
 * @param {number} userId - The user ID
 * @param {object} updateData - Data to update
 * @returns {object} - Update result
 */
const updateUserProfile = async (userId, updateData) => {
  try {
    // This would contain the logic to update user profile
    // For now, returning a placeholder
    return {
      success: true,
      message: 'User profile updated successfully'
    };
  } catch (error) {
    throw new Error(`Error updating user profile: ${error.message}`);
  }
};

module.exports = {
  getUserProfile,
  getUserPermissions,
  updateUserProfile
};