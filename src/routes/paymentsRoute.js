const express = require("express");
const router = express.Router();
const paymentsController = require("../controllers/paymentsController");
const { authenticateToken } = require("../middliewares/authMiddleware");

router.use(authenticateToken);

router.post("/", paymentsController.createPayment);
router.get("/invoice/:invoiceId", paymentsController.getPaymentsByInvoiceId);
router.get("/bill/:billId", paymentsController.getPaymentsByBillId);

module.exports = router;
