const authService = require('../services/authService');

/**
 * Login Controller
 */
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Attempt login using service
    const result = await authService.loginUser(username, password);

    // Set JWT token in httpOnly cookie
    const cookieOptions = {
      httpOnly: true, // Prevents XSS attacks
      secure: process.env.NODE_ENV === 'production', // true for HTTPS in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-origin HTTPS
      maxAge: 86400000, // COOKIE_MAX_AGE=86400000 (24 hours)
      path: '/' 
    };

    res.cookie('authToken', result.token, cookieOptions);

    // Send token in response body for localStorage AND in cookie for httpOnly
    res.status(200).json({
      ...result,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error.message);
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Register User Controller
 */
const registerUser = async (req, res) => {
  try {
    const userData = req.body;

    // Register user using service
    const result = await authService.registerUser(userData);

    res.status(201).json(result);
  } catch (error) {
    console.error('Registration error:', error.message);
    
    if (error.message.includes('already exists')) {
      return res.status(409).json({
        success: false,
        message: error.message
      });
    }
    
    if (error.message.includes('required')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error during registration'
    });
  }
};

/**
 * Logout Controller
 */
const logoutUser = async (req, res) => {
  try {
    // Get token from cookie or header
    const token = req.cookies?.authToken || req.headers['authorization']?.split(' ')[1];
    
    // Logout using service
    const result = await authService.logoutUser(token);
    
    // Clear the auth cookie
    res.clearCookie('authToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // true for HTTPS in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-origin HTTPS
      path: '/'
    });

    res.status(200).json({
      ...result,
      message: 'Logged out successfully - cookie cleared'
    });
  } catch (error) {
    console.error('Logout error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
};

/**
 * Get Current User Profile
 */
const getCurrentUser = async (req, res) => {
  try {
    // Get user profile with permissions from service
    const result = await authService.getUserProfile(req.user.id);
    
    res.status(200).json(result);
  } catch (error) {
    console.error('Get current user error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching user profile'
    });
  }
};

/**
 * Change Password Controller
 */
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required'
      });
    }

    // Change password using service
    const result = await authService.changePassword(userId, currentPassword, newPassword);

    res.status(200).json(result);
  } catch (error) {
    console.error('Change password error:', error.message);
    
    if (error.message.includes('incorrect')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error changing password'
    });
  }
};

module.exports = {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  changePassword
};