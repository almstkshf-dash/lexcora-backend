const jwt = require('jsonwebtoken');
const { getEmployeeById } = require('../models/employeeModel');

// JWT Secret - In production, this should be in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    role_id: user.role_id,
    role_ar: user.role_ar,
    role_en: user.role_en,
    employee_id: user.id, // Fallback to id if employee_id is not explicitly provided
    name: user.name || user.employeeName,
    userType: user.userType || 'employee'
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};


const authenticateToken = async (req, res, next) => {
  try {
    // Get token from cookie first, then fallback to header
    let token = req.cookies?.authToken;

    // If no cookie token, check Authorization header
    if (!token) {
      const authHeader = req.headers['authorization'];
      token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Get user details from database
    const user = await getEmployeeById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    // Add user info to request object with comprehensive data
    // Use role from token if available, otherwise from database
    req.user = {
      id: user.id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      national_id: user.national_id,
      status: user.status,
      role_id: decoded.role_id || user.role_id,
      role_ar: decoded.role_ar || user.role_ar,
      role_en: decoded.role_en || user.role_en,
      employee_id: user.employee_id,
      employeeName: user.name || user.employeeName,
      employeePosition: user.position || user.employeePosition,
      department_id: user.department_id,
      department_ar: user.department_ar,
      department_en: user.department_en,
      managerName: user.managerName,
      direct_manager_id: user.direct_manager_id,
      branch_id: user.branch_id,
      created_at: user.created_at,
      updated_at: user.updated_at
    };

    next();
  } catch (error) {
    console.error('Authentication error:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Internal server error during authentication'
      });
    }
  }
};

const authorizeRoles = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      });
    }

    const userRoleId = req.user.role_id;
    const userRoleAr = req.user.role_ar;
    const userRoleEn = req.user.role_en;

    // Check if user role is in allowed roles (by ID, Arabic name, or English name)
    const hasPermission = allowedRoles.some(role =>
      role === userRoleId ||
      role === userRoleAr ||
      role === userRoleEn
    );

    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      });
    }

    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const decoded = verifyToken(token);
      const user = await getEmployeeById(decoded.id);

      if (user) {
        req.user = {
          id: user.id,
          username: user.username,
          email: user.email,
          phone: user.phone,
          national_id: user.national_id,
          status: user.status,
          role_id: user.role_id,
          role_ar: user.role_ar,
          role_en: user.role_en,
          employee_id: user.employee_id,
          employeeName: user.name || user.employeeName,
          employeePosition: user.position || user.employeePosition,
          department_id: user.department_id,
          department_ar: user.department_ar,
          department_en: user.department_en,
          managerName: user.managerName,
          direct_manager_id: user.direct_manager_id,
          branch_id: user.branch_id,
          created_at: user.created_at,
          updated_at: user.updated_at
        };
      }
    }

    next();
  } catch (error) {
    // If token is invalid, continue without user info
    next();
  }
};

module.exports = {
  generateToken,
  verifyToken,
  authenticateToken,
  authorizeRoles,
  optionalAuth
};
