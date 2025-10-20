const judicialOrdersService = require('../services/judicialOrdersService');

const getAllJudicialOrders = async (req, res) => {
  try {
    const judicialOrders = await judicialOrdersService.getAllJudicialOrders();
    res.json(judicialOrders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch judicial orders' });
  }
};

const createJudicialOrder = async (req, res) => {
  try {
    const judicialOrderId = await judicialOrdersService.createJudicialOrder(req.body);
    res.status(201).json({ id: judicialOrderId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create judicial order' });
  }
};

const updateJudicialOrder = async (req, res) => {
  try {
    const success = await judicialOrdersService.updateJudicialOrder(req.params.id, req.body);
    if (success) {
      res.json({ message: 'Judicial order updated' });
    } else {
      res.status(404).json({ error: 'Judicial order not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update judicial order' });
  }
};

const deleteJudicialOrder = async (req, res) => {
  try {
    const success = await judicialOrdersService.deleteJudicialOrder(req.params.id);
    if (success) {
      res.json({ message: 'Judicial order deleted' });
    } else {
      res.status(404).json({ error: 'Judicial order not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete judicial order' });
  }
};

const getJudicialOrderById = async (req, res) => {
  try {
    const judicialOrder = await judicialOrdersService.getJudicialOrderById(req.params.id);
    if (judicialOrder) {
      res.json({ success: true, data: judicialOrder });
    } else {
      res.status(404).json({ success: false, error: 'Judicial order not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch judicial order' });
  }
};

const getJudicialOrdersByAuthenticationDate = async (req, res) => {
  try {
    const judicialOrders = await judicialOrdersService.getJudicialOrdersByAuthenticationDate(req.params.authenticationDate);
    res.json(judicialOrders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch judicial orders by authentication date' });
  }
};

const getJudicialOrdersByNotificationPeriod = async (req, res) => {
  try {
    const judicialOrders = await judicialOrdersService.getJudicialOrdersByNotificationPeriod(req.params.notificationPeriodDays);
    res.json(judicialOrders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch judicial orders by notification period' });
  }
};

const getJudicialOrdersByCaseId = async (req, res) => {
  try {
    const judicialOrders = await judicialOrdersService.getJudicialOrdersByCaseId(req.params.caseId);
    res.json({ success: true, data: judicialOrders });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch judicial orders by case ID' });
  }
};

const deleteJudicialOrderDocument = async (req, res) => {
  try {
    const success = await judicialOrdersService.deleteJudicialOrderDocument(req.params.id);
    if (success) {
      res.json({ message: 'Judicial order document deleted successfully' });
    } else {
      res.status(404).json({ error: 'Judicial order document not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete judicial order document' });
  }
};

module.exports = {
  getAllJudicialOrders,
  createJudicialOrder,
  updateJudicialOrder,
  deleteJudicialOrder,
  getJudicialOrderById,
  getJudicialOrdersByAuthenticationDate,
  getJudicialOrdersByNotificationPeriod,
  getJudicialOrdersByCaseId,
  deleteJudicialOrderDocument
};