const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middliewares/authMiddleware');


router.post('/login', authController.loginUser);


router.post('/register', authController.registerUser);


router.post('/logout', authenticateToken, authController.logoutUser);


router.get('/me', authenticateToken, authController.getCurrentUser);

router.post('/me', authenticateToken, authController.getCurrentUser);


router.put('/change-password', authenticateToken, authController.changePassword);

module.exports = router;