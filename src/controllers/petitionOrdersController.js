const petitionOrdersService = require('../services/petitionOrdersService');

const getAllPetitionOrders = async (req, res) => {
  try {
    const petitionOrders = await petitionOrdersService.getAllPetitionOrders();
    res.json(petitionOrders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch petition orders' });
  }
};

const createPetitionOrder = async (req, res) => {
  try {
    const petitionOrderId = await petitionOrdersService.createPetitionOrder(req.body);
    res.status(201).json({ id: petitionOrderId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create petition order' });
  }
};

const updatePetitionOrder = async (req, res) => {
  try {
    const success = await petitionOrdersService.updatePetitionOrder(req.params.id, req.body);
    if (success) {
      res.json({ message: 'Petition order updated' });
    } else {
      res.status(404).json({ error: 'Petition order not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update petition order' });
  }
};

const deletePetitionOrder = async (req, res) => {
  try {
    const success = await petitionOrdersService.deletePetitionOrder(req.params.id);
    if (success) {
      res.json({ message: 'Petition order deleted' });
    } else {
      res.status(404).json({ error: 'Petition order not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete petition order' });
  }
};

const getPetitionOrderById = async (req, res) => {
  try {
    const petitionOrder = await petitionOrdersService.getPetitionOrderById(req.params.id);
    if (petitionOrder) {
      res.json(petitionOrder);
    } else {
      res.status(404).json({ error: 'Petition order not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch petition order' });
  }
};

const getPetitionOrdersBySubmissionDate = async (req, res) => {
  try {
    const petitionOrders = await petitionOrdersService.getPetitionOrdersBySubmissionDate(req.params.submissionDate);
    res.json(petitionOrders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch petition orders by submission date' });
  }
};

const getPetitionOrdersByOrderType = async (req, res) => {
  try {
    const petitionOrders = await petitionOrdersService.getPetitionOrdersByOrderType(req.params.orderType);
    res.json(petitionOrders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch petition orders by order type' });
  }
};

const getPetitionOrdersByJudgeDecision = async (req, res) => {
  try {
    const petitionOrders = await petitionOrdersService.getPetitionOrdersByJudgeDecision(req.params.judgeDecision);
    res.json(petitionOrders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch petition orders by judge decision' });
  }
};

const getPetitionOrdersByLastAppealDate = async (req, res) => {
  try {
    const petitionOrders = await petitionOrdersService.getPetitionOrdersByLastAppealDate(req.params.lastAppealDate);
    res.json(petitionOrders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch petition orders by last appeal date' });
  }
};

module.exports = {
  getAllPetitionOrders,
  createPetitionOrder,
  updatePetitionOrder,
  deletePetitionOrder,
  getPetitionOrderById,
  getPetitionOrdersBySubmissionDate,
  getPetitionOrdersByOrderType,
  getPetitionOrdersByJudgeDecision,
  getPetitionOrdersByLastAppealDate
};