const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { body } = require('express-validator');
const { handleValidationErrors } = require('../middlewares/validators');

const loginValidators = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password is required'),
  handleValidationErrors
];

const registerValidators = [
  body('username').trim().notEmpty().withMessage('Username is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role_id').isInt({ min: 1 }).withMessage('role_id is required and must be numeric'),
  handleValidationErrors
];

const changePasswordValidators = [
  body('currentPassword').notEmpty().withMessage('Current password is required'),
  body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters'),
  handleValidationErrors
];

router.post('/login', loginValidators, authController.loginUser);


router.post('/register', registerValidators, authController.registerUser);


router.post('/logout', authenticateToken, authController.logoutUser);


router.get('/me', authenticateToken, authController.getCurrentUser);

router.post('/me', authenticateToken, authController.getCurrentUser);


router.put('/change-password', authenticateToken, changePasswordValidators, authController.changePassword);

module.exports = router;

