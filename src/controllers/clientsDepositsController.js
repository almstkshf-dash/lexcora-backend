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
    const { party_id, amount, description, type, check_number, bank_name, check_date } = req.body;
    const created_by = req.user.id;

    if (!party_id || !amount) {
      return res.status(400).json({
        success: false,
        message: "Party ID and amount are required"
      });
    }

    // Validate payment type
    const validTypes = ['cash', 'card', 'check'];
    const paymentType = type || 'cash';
    
    if (!validTypes.includes(paymentType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment type. Must be: cash, card, or check"
      });
    }

    // Validate check fields if type is check
    if (paymentType === 'check') {
      if (!check_number) {
        return res.status(400).json({
          success: false,
          message: "Check number is required for check payments"
        });
      }
      if (!check_date) {
        return res.status(400).json({
          success: false,
          message: "Check date is required for check payments"
        });
      }
    }

    const result = await clientsDepositsService.createDeposit({
      party_id,
      amount,
      description: description || null,
      type: paymentType,
      check_number: paymentType === 'check' ? check_number : null,
      bank_name: paymentType === 'check' ? (bank_name || null) : null,
      check_date: paymentType === 'check' ? check_date : null,
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
    const { amount, description, type, check_number, bank_name, check_date } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required"
      });
    }

    // Validate payment type
    const validTypes = ['cash', 'card', 'check'];
    const paymentType = type || 'cash';
    
    if (!validTypes.includes(paymentType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid payment type. Must be: cash, card, or check"
      });
    }

    // Validate check fields if type is check
    if (paymentType === 'check') {
      if (!check_number) {
        return res.status(400).json({
          success: false,
          message: "Check number is required for check payments"
        });
      }
      if (!check_date) {
        return res.status(400).json({
          success: false,
          message: "Check date is required for check payments"
        });
      }
    }

    await clientsDepositsService.updateDeposit(id, {
      amount,
      description: description || null,
      type: paymentType,
      check_number: paymentType === 'check' ? check_number : null,
      bank_name: paymentType === 'check' ? (bank_name || null) : null,
      check_date: paymentType === 'check' ? check_date : null
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

const getAccountStatement = async (req, res) => {
  try {
    const { partyId } = req.params;
    const { date_from, date_to } = req.query;

    const statement = await clientsDepositsService.getAccountStatement(
      partyId, 
      date_from, 
      date_to
    );

    res.status(200).json({
      success: true,
      data: statement
    });
  } catch (error) {
    console.error("Error fetching account statement:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch account statement"
    });
  }
};

module.exports = {
  getDepositsByPartyId,
  createDeposit,
  updateDeposit,
  deleteDeposit,
  getAccountStatement
};
