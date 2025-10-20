// petitionOrdersRoute.js
// Routes for petition orders

const express = require('express');
const router = express.Router();
const petitionOrdersController = require('../controllers/petitionOrdersController');

// Get all petition orders
router.get('/', petitionOrdersController.getAllPetitionOrders);

// Get petition order by ID
router.get('/:id', petitionOrdersController.getPetitionOrderById);

// Get petition orders by submission date
router.get('/submission-date/:submissionDate', petitionOrdersController.getPetitionOrdersBySubmissionDate);

// Get petition orders by order type
router.get('/order-type/:orderType', petitionOrdersController.getPetitionOrdersByOrderType);

// Get petition orders by judge decision
router.get('/judge-decision/:judgeDecision', petitionOrdersController.getPetitionOrdersByJudgeDecision);

// Get petition orders by last appeal date
router.get('/last-appeal-date/:lastAppealDate', petitionOrdersController.getPetitionOrdersByLastAppealDate);

// Create a new petition order
router.post('/', petitionOrdersController.createPetitionOrder);

// Update a petition order by ID
router.put('/:id', petitionOrdersController.updatePetitionOrder);

// Delete a petition order by ID
router.delete('/:id', petitionOrdersController.deletePetitionOrder);

module.exports = router;