const express = require('express');
const router = express.Router();
const courtsController = require('../controllers/courtsController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// GET /api/courts - Get all courts
router.get('/', courtsController.getAllCourts);

// GET /api/courts/:id - Get court by ID
router.get('/:id', courtsController.getCourtById);

// POST /api/courts - Create new court
router.post('/', authenticateToken, courtsController.createCourt);

// PUT /api/courts/:id - Update court
router.put('/:id', authenticateToken, courtsController.updateCourt);

// DELETE /api/courts/:id - Delete court
router.delete('/:id', authenticateToken, courtsController.deleteCourt);

module.exports = router;
