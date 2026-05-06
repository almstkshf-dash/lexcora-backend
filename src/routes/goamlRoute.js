const express = require("express");
const router = express.Router();
const goamlController = require("../controllers/goamlController");
const { authenticateToken } = require("../middlewares/authMiddleware");

// GoAML routes
router.get("/", authenticateToken, goamlController.getAllGoamlRecords);           // GET /goaml
router.get("/:id", authenticateToken, goamlController.getGoamlRecordById);        // GET /goaml/:id
router.post("/", authenticateToken, goamlController.createGoamlRecord);           // POST /goaml
router.put("/:id", authenticateToken, goamlController.updateGoamlRecord);         // PUT /goaml/:id
router.delete("/:id", authenticateToken, goamlController.deleteGoamlRecord);      // DELETE /goaml/:id

module.exports = router;

