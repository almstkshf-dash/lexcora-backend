const clientRequestsService = require("../services/clientRequestsService");

const addClientRequest = async (req, res) => {
  try {
    const createdBy = req.user ? req.user.id : null;
    
    const result = await clientRequestsService.addClientRequest(req.body, createdBy);
    
    res.status(201).json({
      success: true,
      message: "Client request added successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in addClientRequest controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getAllClientRequests = async (req, res) => {
  try {
    const clientRequests = await clientRequestsService.getAllClientRequests();
    res.status(200).json({
      success: true,
      message: "Client requests retrieved successfully",
      data: clientRequests,
    });
  } catch (error) {
    console.error("Error in getAllClientRequests controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const getClientRequestById = async (req, res) => {
  try {
    const { id } = req.params;
    const clientRequest = await clientRequestsService.getClientRequestById(id);
    res.status(200).json({
      success: true,
      message: "Client request retrieved successfully",
      data: clientRequest,
    });
  } catch (error) {
    console.error("Error in getClientRequestById controller:", error);
    if (error.message === "Client request not found") {
      res.status(404).json({
        success: false,
        message: "Client request not found",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
};

const getClientRequestsByClientId = async (req, res) => {
  try {
    const { client_id } = req.params;
    const clientRequests = await clientRequestsService.getClientRequestsByClientId(client_id);
    res.status(200).json({
      success: true,
      message: "Client requests retrieved successfully",
      data: clientRequests,
    });
  } catch (error) {
    console.error("Error in getClientRequestsByClientId controller:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

const updateClientRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedBy = req.user ? req.user.id : null;
    const result = await clientRequestsService.updateClientRequest(id, req.body, updatedBy);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in updateClientRequest controller:", error);
    if (error.message === "Client request not found or not updated") {
      res.status(404).json({
        success: false,
        message: "Client request not found",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
};

const deleteClientRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await clientRequestsService.deleteClientRequest(id);
    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Error in deleteClientRequest controller:", error);
    if (error.message === "Client request not found or not deleted") {
      res.status(404).json({
        success: false,
        message: "Client request not found",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  }
};

module.exports = {
  addClientRequest,
  getAllClientRequests,
  getClientRequestById,
  getClientRequestsByClientId,
  updateClientRequest,
  deleteClientRequest,
};