const express = require("express");
const router = express.Router();
const accountingController = require("../controllers/accountingController");
const { authenticateToken } = require("../middliewares/authMiddleware");

router.use(authenticateToken);

// Ledger endpoint alias for journal entries
router.get("/", accountingController.getJournalEntries);
router.get("/:id", accountingController.getJournalEntry);

module.exports = router;
