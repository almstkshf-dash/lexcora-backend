const express = require('express');
const router = express.Router();
const jobsController = require('../controllers/jobsController');
const { authenticateToken } = require('../middlewares/authMiddleware');

// Queue a new job
router.post('/', authenticateToken, jobsController.createJob);

// Get job status
router.get('/:id', authenticateToken, jobsController.getJobStatus);

// List recent jobs
router.get('/', authenticateToken, jobsController.listQueuedJobs);

module.exports = router;

