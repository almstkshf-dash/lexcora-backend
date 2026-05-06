const express = require("express");
const router = express.Router();
const callLogsController = require("../controllers/callLogsController");
const { authenticateToken } = require("../middlewares/authMiddleware");

// Call logs routes
router.get("/", authenticateToken, callLogsController.getAllCallLogs);           // GET /call-logs
router.get("/:id", authenticateToken, callLogsController.getCallLogById);        // GET /call-logs/:id
router.post("/", authenticateToken, callLogsController.createCallLog);           // POST /call-logs
router.put("/:id", authenticateToken, callLogsController.updateCallLog);         // PUT /call-logs/:id
router.delete("/:id", authenticateToken, callLogsController.deleteCallLog);      // DELETE /call-logs/:id

module.exports = router;

