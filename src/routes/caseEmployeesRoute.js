const express = require("express");
const router = express.Router();
const caseEmployeesController = require("../controllers/caseEmployeesController");

router.get("/", caseEmployeesController.getAllCaseEmployees);

router.post("/", caseEmployeesController.createCaseEmployee);

// GET /api/case-employees/:id - Get case employee by ID
router.get("/:id", caseEmployeesController.getCaseEmployeeById);

// PUT /api/case-employees/:id - Update case employee by ID
router.put("/:id", caseEmployeesController.updateCaseEmployee);

// DELETE /api/case-employees/:id - Delete case employee by ID
router.delete("/:id", caseEmployeesController.deleteCaseEmployee);

// GET /api/case-employees/case/:caseId - Get all employees for a specific case
router.get("/case/:caseId", caseEmployeesController.getCaseEmployeesByCaseId);

// GET /api/case-employees/name/:name - Get employees by name (search)
router.get("/name/:name", caseEmployeesController.getCaseEmployeesByName);

module.exports = router;