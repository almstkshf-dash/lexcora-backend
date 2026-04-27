const express = require("express");
const router = express.Router();
const billsController = require("../controllers/billsController");
const { authenticateToken } = require("../middliewares/authMiddleware");

router.use(authenticateToken);

router.get("/", billsController.getAllBills);
router.get("/:id", billsController.getBillById);
router.post("/", billsController.createBill);
router.put("/:id/status", billsController.updateBillStatus);

module.exports = router;
