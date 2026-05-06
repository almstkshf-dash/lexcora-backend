const authService = require('../services/authService');
const { AppError } = require('../utils/errors');

/**
 * Login Controller
 */
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      throw new AppError(req.t('auth.credentialsRequired'), 400, 'VALIDATION_ERROR');
    }

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
    return res.success(result, req.t('auth.loginSuccess'));
  } catch (error) {
    const mappedError = error instanceof AppError
      ? error
      : new AppError(error.message || 'Login failed', error.message?.includes('Invalid') ? 401 : 500, 'AUTH_ERROR');
    return res.fail(mappedError.message, mappedError.statusCode, mappedError.errorCode);
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

    return res.created(result, req.t('auth.registrationSuccess'));
  } catch (error) {
    console.error('Registration error:', error.message);
    const status = error.message.includes('already exists') ? 409 : error.message.includes('required') ? 400 : 500;
    const code = status === 409 ? 'USER_EXISTS' : status === 400 ? 'VALIDATION_ERROR' : 'INTERNAL_ERROR';
    return res.fail(error.message || 'Registration failed', status, code);
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

    return res.success(result, req.t('auth.logoutSuccess'));
  } catch (error) {
    console.error('Logout error:', error.message);
    return res.fail('Error during logout', 500, 'LOGOUT_ERROR');
  }
};

/**
 * Get Current User Profile
 */
const getCurrentUser = async (req, res) => {
  try {
    // Get user profile with permissions from service
    const result = await authService.getUserProfile(req.user.id);
    
    return res.success(result, req.t('auth.profileFetched'));
  } catch (error) {
    console.error('[GET_CURRENT_USER_ERROR]', {
      message: error.message,
      stack: error.stack,
      userId: req.user?.id
    });
    return res.fail('Error fetching user profile', 500, 'PROFILE_ERROR');
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
      return res.fail(req.t('auth.currentPasswordRequired'), 400, 'VALIDATION_ERROR');
    }

    // Change password using service
    const result = await authService.changePassword(userId, currentPassword, newPassword);

    return res.success(result, req.t('auth.passwordChanged'));
  } catch (error) {
    console.error('Change password error:', error.message);
    
    if (error.message.includes('incorrect')) {
      return res.fail(error.message, 400, 'VALIDATION_ERROR');
    }

    return res.fail('Error changing password', 500, 'PASSWORD_CHANGE_ERROR');
  }
};

module.exports = {
  loginUser,
  registerUser,
  logoutUser,
  getCurrentUser,
  changePassword
};
