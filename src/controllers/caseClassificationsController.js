
const caseClassificationsService = require('../services/caseClassificationsService');

const getAllCaseClassifications = async (req, res) => {
  try {
    const classifications = await caseClassificationsService.getAllCaseClassifications();
    res.json({success: true, data: classifications});
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch case classifications', error: error.message });
  }
};

const createCaseClassification = async (req, res) => {
  try {
    const classificationId = await caseClassificationsService.createCaseClassification(req.body);
    res.status(201).json({ id: classificationId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create case classification' });
  }
};

const updateCaseClassification = async (req, res) => {
  try {
    const success = await caseClassificationsService.updateCaseClassification(req.params.id, req.body);
    if (success) {
      res.json({ message: 'Case classification updated' });
    } else {
      res.status(404).json({ error: 'Case classification not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update case classification' });
  }
};

const deleteCaseClassification = async (req, res) => {
  try {
    const success = await caseClassificationsService.deleteCaseClassification(req.params.id);
    if (success) {
      res.json({ message: 'Case classification deleted' });
    } else {
      res.status(404).json({ error: 'Case classification not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete case classification' });
  }
};

module.exports = {
  getAllCaseClassifications,
  createCaseClassification,
  updateCaseClassification,
  deleteCaseClassification
};
