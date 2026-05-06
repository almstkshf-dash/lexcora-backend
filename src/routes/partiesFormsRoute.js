const express = require("express");
const router = express.Router();
const {
  getPartiesForms,
  getPartiesForm,
  createPartiesForm,
  updatePartiesForm,
  deletePartiesForm,
  getPartiesFormTypes,
  downloadPartiesForm
} = require("../controllers/partiesFormsController");
const { authenticateToken } = require("../middlewares/authMiddleware");

// Parties Forms routes
router.get("/", authenticateToken, getPartiesForms);
router.get("/types", authenticateToken, getPartiesFormTypes);
router.get("/:id", authenticateToken, getPartiesForm);
router.get("/:id/download", authenticateToken, downloadPartiesForm);
router.post("/", authenticateToken, createPartiesForm);
router.put("/:id", authenticateToken, updatePartiesForm);
router.delete("/:id", authenticateToken, deletePartiesForm);

module.exports = router;

