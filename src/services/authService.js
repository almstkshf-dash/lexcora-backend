const { getEmployeeByUsername, createEmployee, getEmployeeById, updateEmployeePassword, getEmployeePermissions, updateEmployeeLastLogin } = require('../models/employeeModel');
const { generateToken } = require('../middliewares/authMiddleware');
const { logLogin } = require('./logsService');


const loginUser = async (username, password) => {
  try {
    // Validate input
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    // Get employee by username
    const user = await getEmployeeByUsername(username);
    
    if (!user) {
      throw new Error('Invalid username or password');
    }

    if (password !== user.password) {
      throw new Error('Invalid username or password');
    }

    // Check if employee status is active
    if (user.status !== 'active') {
      throw new Error('حسابك غير مفعل. يرجى التواصل مع الإدارة');
    }

    // Generate token
    const token = generateToken(user);

    // Update last login time
    await updateEmployeeLastLogin(user.id);

    // Log the login action
    await logLogin(user.id, user.name || user.username);

    // Get employee permissions
    const permissions = await getEmployeePermissions(user.id);

    // Return employee info (without password) and token
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      user: userWithoutPassword,
      permissions,
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    };
  } catch (error) {
    throw error;
  }
};

const registerUser = async (userData) => {
  try {
    const { username, password, role_id, name, email, department_id } = userData;

    // Validate required fields
    if (!username || !password || !role_id) {
      throw new Error('Username, password, and role_id are required');
    }

    // Check if username already exists
    const existingUser = await getEmployeeByUsername(username);
    if (existingUser) {
      throw new Error('Username already exists');
    }

    // Create employee data with plain password
    const newEmployeeData = {
      ...userData,
      password: password // Store password as plain text
    };

    // Create employee in database
    const employeeId = await createEmployee(newEmployeeData);

    return {
      success: true,
      message: 'Employee registered successfully',
      userId: employeeId
    };
  } catch (error) {
    throw error;
  }
};


const getUserProfile = async (userId) => {
  try {
    const user = await getEmployeeById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Get employee permissions
    const permissions = await getEmployeePermissions(userId);

    // Return user without password
    const { password: _, ...userProfile } = user;
    
    return {
      user: userProfile,
      permissions
    };
  } catch (error) {
    throw error;
  }
};


const changePassword = async (userId, currentPassword, newPassword) => {
  try {
    // Get employee
    const user = await getEmployeeById(userId);
    if (!user) {
      throw new Error('Employee not found');
    }

    // Verify current password (plain text comparison)
    if (currentPassword !== user.password) {
      throw new Error('Current password is incorrect');
    }

    // Update password in database (plain text)
    const passwordUpdated = await updateEmployeePassword(userId, newPassword);
    
    if (!passwordUpdated) {
      throw new Error('Failed to update password');
    }

    return {
      success: true,
      message: 'Password changed successfully'
    };
  } catch (error) {
    throw error;
  }
};


const logoutUser = async (token) => {
  try {
    // In a production environment, you might want to:
    // 1. Add the token to a blacklist (Redis recommended)
    // 2. Clear any server-side sessions
    // 3. Log the logout event
    
    // For now, just return success
    return {
      success: true,
      message: 'Logged out successfully'
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  loginUser,
  registerUser,
  getUserProfile,
  changePassword,
  logoutUser
};