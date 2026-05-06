const express = require("express");
const router = express.Router();
const eventsController = require("../controllers/eventsController");
const { authenticateToken } = require("../middlewares/authMiddleware");

// Events routes
router.get("/", authenticateToken, eventsController.getAllEvents);           // GET /events
router.get("/:id", authenticateToken, eventsController.getEventById);        // GET /events/:id
router.post("/", authenticateToken, eventsController.createEvent);           // POST /events
router.put("/:id", authenticateToken, eventsController.updateEvent);         // PUT /events/:id
router.delete("/:id", authenticateToken, eventsController.deleteEvent);      // DELETE /events/:id

module.exports = router;

