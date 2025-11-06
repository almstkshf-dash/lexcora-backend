const clientsDepositsService = require("../services/clientsDepositsService");

const getDepositsByPartyId = async (req, res) => {
  try {
    const { partyId } = req.params;
    const deposits = await clientsDepositsService.getDepositsByPartyId(partyId);
    
    res.status(200).json({
      success: true,
      data: deposits
    });
  } catch (error) {
    console.error("Error fetching deposits:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch deposits"
    });
  }
};

const createDeposit = async (req, res) => {
  try {
    const { party_id, amount, description } = req.body;
    const created_by = req.user.id;

    if (!party_id || !amount) {
      return res.status(400).json({
        success: false,
        message: "Party ID and amount are required"
      });
    }

    const result = await clientsDepositsService.createDeposit({
      party_id,
      amount,
      description: description || null,
      created_by
    });

    res.status(201).json({
      success: true,
      message: "Deposit created successfully",
      data: result
    });
  } catch (error) {
    console.error("Error creating deposit:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create deposit"
    });
  }
};

const updateDeposit = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, description } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required"
      });
    }

    await clientsDepositsService.updateDeposit(id, {
      amount,
      description: description || null
    });

    res.status(200).json({
      success: true,
      message: "Deposit updated successfully"
    });
  } catch (error) {
    console.error("Error updating deposit:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update deposit"
    });
  }
};

const deleteDeposit = async (req, res) => {
  try {
    const { id } = req.params;

    await clientsDepositsService.deleteDeposit(id);

    res.status(200).json({
      success: true,
      message: "Deposit deleted successfully"
    });
  } catch (error) {
    console.error("Error deleting deposit:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete deposit"
    });
  }
};

module.exports = {
  getDepositsByPartyId,
  createDeposit,
  updateDeposit,
  deleteDeposit
};
