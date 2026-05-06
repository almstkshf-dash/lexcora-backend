const express = require('express');
const router = express.Router();
const trainingsController = require('../controllers/trainingsController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// All routes require authentication
router.get('/', authenticateToken, trainingsController.getTrainings);
router.get('/:id', authenticateToken, trainingsController.getTraining);
router.get('/:id/documents', authenticateToken, trainingsController.getTrainingDocuments);
router.post('/', authenticateToken, trainingsController.createTraining);
router.put('/:id', authenticateToken, trainingsController.updateTraining);
router.delete('/:trainingId/documents/:documentId', authenticateToken, trainingsController.deleteTrainingDocument);
router.delete('/:id', authenticateToken, trainingsController.deleteTraining);

module.exports = router;

