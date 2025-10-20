const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const { authenticateToken } = require("../middliewares/authMiddleware");

// Main employee routes
router.get("/", authenticateToken, employeeController.getEmployees);                    // GET /employees
router.post("/", authenticateToken, employeeController.createEmployee);               // POST /employees
router.get("/:id", authenticateToken, employeeController.getEmployee);                // GET /employees/:id
router.put("/:id", authenticateToken, employeeController.updateEmployee);             // PUT /employees/:id
router.delete("/:id", authenticateToken, employeeController.deleteEmployee);          // DELETE /employees/:id

module.exports = router;