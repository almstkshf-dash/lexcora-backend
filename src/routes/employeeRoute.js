const express = require("express");
const router = express.Router();
const employeeController = require("../controllers/employeeController");
const { authenticateToken } = require("../middliewares/authMiddleware");
const { checkPermission } = require("../middlewares/permissionsMiddleware");
const { PERMISSIONS } = require("../config/permissions");
const { paginationValidator, searchValidator, sortValidator } = require("../middlewares/validators");

// Main employee routes
router.get(
  "/",
  authenticateToken,
  checkPermission(PERMISSIONS.employees.list),
  paginationValidator,
  searchValidator,
  sortValidator(['name', 'status', 'username', 'id', 'balance']),
  employeeController.getEmployees
);                    // GET /employees
router.get("/check-duplicate", authenticateToken, checkPermission(PERMISSIONS.employees.list), employeeController.checkDuplicateEmployee);             // GET /employees/check-duplicate (before authenticated routes)
router.post("/", authenticateToken, checkPermission(PERMISSIONS.employees.create), employeeController.createEmployee);               // POST /employees
router.get("/:id", authenticateToken, checkPermission(PERMISSIONS.employees.view), employeeController.getEmployee);                // GET /employees/:id
router.put("/:id", authenticateToken, checkPermission(PERMISSIONS.employees.update), employeeController.updateEmployee);             // PUT /employees/:id
router.delete("/:id", authenticateToken, checkPermission(PERMISSIONS.employees.delete), employeeController.deleteEmployee);          // DELETE /employees/:id

// Employee account statement
router.get("/:id/account-statement", authenticateToken, checkPermission(PERMISSIONS.employees.accountStatement), employeeController.getEmployeeAccountStatement);  // GET /employees/:id/account-statement

module.exports = router;
