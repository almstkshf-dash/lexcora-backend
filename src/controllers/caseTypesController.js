
const caseTypesService = require('../services/caseTypesService');

const getAllCaseTypes = async (req, res) => {
  try {
    const types = await caseTypesService.getAllCaseTypes();
    res.json({ success: true, data: types });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch case types', error: error.message });
  }
};

const createCaseType = async (req, res) => {
  try {
    const typeId = await caseTypesService.createCaseType(req.body);
    res.status(201).json({ id: typeId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create case type' });
  }
};

const updateCaseType = async (req, res) => {
  try {
    const success = await caseTypesService.updateCaseType(req.params.id, req.body);
    if (success) {
      res.json({ message: 'Case type updated' });
    } else {
      res.status(404).json({ error: 'Case type not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update case type' });
  }
};

const deleteCaseType = async (req, res) => {
  try {
    const success = await caseTypesService.deleteCaseType(req.params.id);
    if (success) {
      res.json({ message: 'Case type deleted' });
    } else {
      res.status(404).json({ error: 'Case type not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete case type' });
  }
};

module.exports = {
  getAllCaseTypes,
  createCaseType,
  updateCaseType,
  deleteCaseType
};
