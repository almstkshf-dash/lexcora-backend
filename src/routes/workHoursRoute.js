const express = require("express");
const router = express.Router();
const {
  getWorkingHours,
  updateWorkingHours,
} = require("../controllers/workHoursController");
const { authenticateToken } = require("../middliewares/authMiddleware");

// Get current working hours
router.get("/", authenticateToken, getWorkingHours);

// Update working hours
router.put("/", authenticateToken, updateWorkingHours);

module.exports = router;