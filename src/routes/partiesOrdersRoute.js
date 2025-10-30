const express = require("express");
const router = express.Router();
const partiesOrdersController = require("../controllers/partiesOrdersController");
const { authenticateToken } = require("../middliewares/authMiddleware");
// const { 
//   idValidator, 
//   paginationValidator, 
//   partyOrderValidators 
// } = require("../middlewares/validators");
// const { param } = require('express-validator');
// const { handleValidationErrors } = require('../middlewares/validators');

// Custom validator for partyId parameter
// const partyIdValidator = [
//   param('partyId').isInt({ min: 1 }).withMessage('Party ID must be a positive integer'),
//   handleValidationErrors
// ];

// Get all parties orders with pagination and filters
// Query params: page, limit, party_id, status, type, case_number
// Now validates pagination parameters (page must be positive, limit between 1-100)
router.get("/", authenticateToken, partiesOrdersController.getAllPartiesOrders);

// Get all orders for a specific party (MUST come before /:id to avoid conflicts)
// Now validates that partyId is a positive integer
router.get("/party/:partyId", authenticateToken, partiesOrdersController.getOrdersByPartyId);

// Get a specific party order by ID
// Now validates that id is a positive integer
router.get("/:id", authenticateToken, partiesOrdersController.getPartyOrderById);

// Create a new party order
// Now validates all required fields and data types before processing
router.post("/", authenticateToken, partiesOrdersController.createPartyOrder);

// Update a party order
// Now validates id and update fields
router.put("/:id", authenticateToken, partiesOrdersController.updatePartyOrder);

// Delete a party order
// Now validates that id is a positive integer
router.delete("/:id", authenticateToken, partiesOrdersController.deletePartyOrder);

module.exports = router;
