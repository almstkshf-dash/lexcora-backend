const express = require("express");
const router = express.Router();
const {
  getAttendance,
  addAttendance,
  updateAttendanceRecord,
  deleteAttendanceRecord,
} = require("../controllers/employeeAttendanceController");
const { authenticateToken } = require("../middliewares/authMiddleware");

// Get attendance records for an employee
router.get("/:employeeId", authenticateToken, getAttendance);

// Create new attendance record
router.post("/", authenticateToken, addAttendance);

// Update attendance record
router.put("/:id", authenticateToken, updateAttendanceRecord);

// Delete attendance record
router.delete("/:id", authenticateToken, deleteAttendanceRecord);

module.exports = router;
