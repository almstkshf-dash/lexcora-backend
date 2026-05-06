const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviewsController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { paginationValidator, sortValidator } = require('../middlewares/validators');

// All routes require authentication
router.get(
  '/',
  authenticateToken,
  paginationValidator,
  sortValidator(['date', 'created_at', 'id']),
  reviewsController.getReviews
);
router.get('/:id', authenticateToken, reviewsController.getReview);
router.get('/:id/documents', authenticateToken, reviewsController.getReviewDocuments);
router.post('/', authenticateToken, reviewsController.createReview);
router.put('/:id', authenticateToken, reviewsController.updateReview);
router.delete('/:reviewId/documents/:documentId', authenticateToken, reviewsController.deleteReviewDocument);
router.delete('/:id', authenticateToken, reviewsController.deleteReview);

module.exports = router;

