const express = require("express");
const clientRequestsController = require("../controllers/clientRequestsController");
const { authenticateToken } = require("../middliewares/authMiddleware");

const router = express.Router();

// Routes for client requests
router.post("/", authenticateToken, clientRequestsController.addClientRequest);
router.get("/", authenticateToken, clientRequestsController.getAllClientRequests);
router.get("/:id", authenticateToken, clientRequestsController.getClientRequestById);
router.get("/client/:client_id", authenticateToken, clientRequestsController.getClientRequestsByClientId);
router.put("/:id", authenticateToken, clientRequestsController.updateClientRequest);
router.delete("/:id", authenticateToken, clientRequestsController.deleteClientRequest);

module.exports = router;