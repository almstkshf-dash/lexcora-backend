const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const { authenticateToken } = require("../middliewares/authMiddleware");
const { checkPermission } = require("../middlewares/permissionsMiddleware");

// Main employee routes
router.get("/", authenticateToken, employeeController.getEmployees);                    // GET /employees
router.get("/check-duplicate", employeeController.checkDuplicateEmployee);             // GET /employees/check-duplicate (before authenticated routes)
router.post("/", authenticateToken, employeeController.createEmployee);               // POST /employees
router.get("/:id", authenticateToken, checkPermission("View Employee"), employeeController.getEmployee);                // GET /employees/:id
router.put("/:id", authenticateToken, employeeController.updateEmployee);             // PUT /employees/:id
router.delete("/:id", authenticateToken, employeeController.deleteEmployee);          // DELETE /employees/:id

// Employee account statement
router.get("/:id/account-statement", authenticateToken, employeeController.getEmployeeAccountStatement);  // GET /employees/:id/account-statement

module.exports = router;