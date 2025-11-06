const express = require("express");
const router = express.Router();
const partiesOrdersController = require("../controllers/partiesOrdersController");
const { authenticateToken } = require("../middliewares/authMiddleware");
const { check } = require("express-validator");
const { checkPermission } = require("../middlewares/permissionsMiddleware");
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
router.get("/", authenticateToken, checkPermission('View Parties Orders'), partiesOrdersController.getAllPartiesOrders);

// Get all orders for a specific party (MUST come before /:id to avoid conflicts)
// Now validates that partyId is a positive integer
router.get("/party/:partyId", authenticateToken , partiesOrdersController.getOrdersByPartyId);

// Get a specific party order by ID
// Now validates that id is a positive integer
router.get("/:id", authenticateToken, checkPermission('View Party Order'), partiesOrdersController.getPartyOrderById);

// Create a new party order
// Now validates all required fields and data types before processing
router.post("/", authenticateToken, checkPermission('Add Party Order'), partiesOrdersController.createPartyOrder);

// Update a party order
// Now validates id and update fields
router.put("/:id", authenticateToken, checkPermission('Edit Party Order'), partiesOrdersController.updatePartyOrder);

// Delete a party order
// Now validates that id is a positive integer
router.delete("/:id", authenticateToken, checkPermission('Delete Party Order'), partiesOrdersController.deletePartyOrder);

module.exports = router;
