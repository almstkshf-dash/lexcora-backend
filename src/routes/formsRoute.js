const express = require("express");
const router = express.Router();
const {
  getForms,
  getForm,
  createForm,
  updateForm,
  deleteForm,
  getFormTypes,
  downloadForm
} = require("../controllers/formsController");
const { authenticateToken } = require("../middlewares/authMiddleware");

// Forms routes
router.get("/", authenticateToken, getForms);
router.get("/types", authenticateToken, getFormTypes);
router.get("/:id", authenticateToken, getForm);
router.get("/:id/download", authenticateToken, downloadForm);
router.post("/", authenticateToken, createForm);
router.put("/:id", authenticateToken, updateForm);
router.delete("/:id", authenticateToken, deleteForm);

module.exports = router;
