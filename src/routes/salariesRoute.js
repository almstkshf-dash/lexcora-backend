const express = require("express");
const router = express.Router();
const salariesController = require("../controllers/salariesController");
const { authenticateToken } = require("../middliewares/authMiddleware");
const { checkPermission } = require("../middlewares/permissionsMiddleware");
const { PERMISSIONS } = require("../config/permissions");

router.get(
  "/",
  authenticateToken,
  checkPermission(PERMISSIONS.payroll.view),
  salariesController.getSalaries
);

router.get(
  "/:id",
  authenticateToken,
  checkPermission(PERMISSIONS.payroll.view),
  salariesController.getSalaryById
);

router.post(
  "/process",
  authenticateToken,
  checkPermission(PERMISSIONS.payroll.process),
  salariesController.processPayroll
);

router.post(
  "/:id/pay",
  authenticateToken,
  checkPermission(PERMISSIONS.payroll.pay),
  salariesController.paySalary
);

module.exports = router;
