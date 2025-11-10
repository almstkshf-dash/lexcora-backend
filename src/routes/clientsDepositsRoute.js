const express = require("express");
const router = express.Router();
const clientsDepositsController = require("../controllers/clientsDepositsController");
const { authenticateToken } = require("../middliewares/authMiddleware");

// Get deposits by party ID
router.get("/party/:partyId", authenticateToken, clientsDepositsController.getDepositsByPartyId);

// Get account statement (كشف الحساب) by party ID with date filtering
router.get("/account-statement/:partyId", authenticateToken, clientsDepositsController.getAccountStatement);

// Create new deposit
router.post("/", authenticateToken, clientsDepositsController.createDeposit);

// Update deposit
router.put("/:id", authenticateToken, clientsDepositsController.updateDeposit);

// Delete deposit
router.delete("/:id", authenticateToken, clientsDepositsController.deleteDeposit);

module.exports = router;
