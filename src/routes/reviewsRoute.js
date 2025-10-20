const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');
const { authenticateToken } = require('../middliewares/authMiddleware');

// All routes require authentication
router.get('/', authenticateToken, reviewsController.getReviews);
router.get('/:id', authenticateToken, reviewsController.getReview);
router.get('/:id/documents', authenticateToken, reviewsController.getReviewDocuments);
router.post('/', authenticateToken, reviewsController.createReview);
router.put('/:id', authenticateToken, reviewsController.updateReview);
router.delete('/:reviewId/documents/:documentId', authenticateToken, reviewsController.deleteReviewDocument);
router.delete('/:id', authenticateToken, reviewsController.deleteReview);

module.exports = router;
