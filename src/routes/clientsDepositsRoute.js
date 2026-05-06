const express = require("express");
const router = express.Router();
const clientsDepositsController = require("../controllers/clientsDepositsController");
const { authenticateToken } = require("../middlewares/authMiddleware");
const { checkPermission } = require("../middlewares/permissionsMiddleware");
const { PERMISSIONS } = require("../config/permissions");
const { paginationValidator, sortValidator } = require("../middlewares/validators");

// Get deposits by party ID
router.get(
  "/party/:partyId",
  authenticateToken,
  checkPermission(PERMISSIONS.clientsDeposits.view),
  paginationValidator,
  sortValidator(['created_at', 'amount']),
  clientsDepositsController.getDepositsByPartyId
);

// Get account statement (??? ??????) by party ID with date filtering
router.get("/account-statement/:partyId", authenticateToken, checkPermission(PERMISSIONS.clientsDeposits.view), clientsDepositsController.getAccountStatement);

// Create new deposit
router.post("/", authenticateToken, checkPermission(PERMISSIONS.clientsDeposits.create), clientsDepositsController.createDeposit);

// Update deposit
router.put("/:id", authenticateToken, checkPermission(PERMISSIONS.clientsDeposits.update), clientsDepositsController.updateDeposit);

// Delete deposit
router.delete("/:id", authenticateToken, checkPermission(PERMISSIONS.clientsDeposits.delete), clientsDepositsController.deleteDeposit);

module.exports = router;

