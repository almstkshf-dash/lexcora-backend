const partiesOrdersService = require("../services/partiesOrdersService");

// Get all parties orders with pagination and filters
const getAllPartiesOrders = async (req, res) => {
  try {
    const filters = {
      page: req.query.page,
      limit: req.query.limit,
      party_id: req.query.party_id,
      status: req.query.status,
      type: req.query.type,
      search: req.query.search
    };
    
    const result = await partiesOrdersService.getAllPartiesOrders(filters);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getAllPartiesOrders:", error);
    res.status(500).json({ 
      message: "Error fetching parties orders", 
      error: error.message 
    });
  }
};

// Get a single party order by ID
const getPartyOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = await partiesOrdersService.getPartyOrderById(id);
    res.status(200).json(order);
  } catch (error) {
    console.error("Error in getPartyOrderById:", error);
    if (error.message === "Party order not found") {
      return res.status(404).json({ 
        message: "Party order not found" 
      });
    }
    res.status(500).json({ 
      message: "Error fetching party order", 
      error: error.message 
    });
  }
};

// Get all orders for a specific party
const getOrdersByPartyId = async (req, res) => {
  try {
    const { partyId } = req.params;
    const orders = await partiesOrdersService.getOrdersByPartyId(partyId);
    res.status(200).json(orders);
  } catch (error) {
    console.error("Error in getOrdersByPartyId:", error);
    res.status(500).json({ 
      message: "Error fetching party orders", 
      error: error.message 
    });
  }
};

// Create a new party order
const createPartyOrder = async (req, res) => {
  try {
    const { party_id, type, date, status, case_number, details } = req.body;
    const createdBy = req.user ? req.user.id : null;
    
    // Validation
    if (!party_id) {
      return res.status(400).json({ message: "party_id is required" });
    }
    
    const orderData = {
      party_id,
      type,
      date,
      status,
      case_number,
      details,
      created_by: createdBy
    };
    
    const orderId = await partiesOrdersService.createPartyOrder(orderData, createdBy);
    res.status(201).json({ 
      message: "Party order created successfully", 
      id: orderId 
    });
  } catch (error) {
    console.error("Error in createPartyOrder:", error);
    res.status(500).json({ 
      message: "Error creating party order", 
      error: error.message 
    });
  }
};

// Update a party order
const updatePartyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const orderData = req.body;
    const updatedBy = req.user ? req.user.id : null;
    
    const result = await partiesOrdersService.updatePartyOrder(id, orderData, updatedBy);
    res.status(200).json({ 
      message: result.message 
    });
  } catch (error) {
    console.error("Error in updatePartyOrder:", error);
    if (error.message === "Party order not found or not updated") {
      return res.status(404).json({ 
        message: "Party order not found or no changes made" 
      });
    }
    res.status(500).json({ 
      message: "Error updating party order", 
      error: error.message 
    });
  }
};

// Delete a party order
const deletePartyOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await partiesOrdersService.deletePartyOrder(id);
    res.status(200).json({ 
      message: result.message 
    });
  } catch (error) {
    console.error("Error in deletePartyOrder:", error);
    if (error.message === "Party order not found or not deleted") {
      return res.status(404).json({ 
        message: "Party order not found" 
      });
    }
    res.status(500).json({ 
      message: "Error deleting party order", 
      error: error.message 
    });
  }
};

module.exports = {
  getAllPartiesOrders,
  getPartyOrderById,
  getOrdersByPartyId,
  createPartyOrder,
  updatePartyOrder,
  deletePartyOrder
};
