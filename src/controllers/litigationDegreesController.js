const litigationDegreesService = require('../services/litigationDegreesService');

const getAllLitigationDegrees = async (req, res) => {
  try {
    const litigationDegrees = await litigationDegreesService.getAllLitigationDegrees();
    res.json(litigationDegrees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch litigation degrees' });
  }
};

const createLitigationDegree = async (req, res) => {
  try {
    const litigationDegreeId = await litigationDegreesService.createLitigationDegree(req.body);
    res.status(201).json({ id: litigationDegreeId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create litigation degree' });
  }
};

const updateLitigationDegree = async (req, res) => {
  try {
    const success = await litigationDegreesService.updateLitigationDegree(req.params.id, req.body);
    if (success) {
      res.json({ message: 'Litigation degree updated' });
    } else {
      res.status(404).json({ error: 'Litigation degree not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update litigation degree' });
  }
};

const deleteLitigationDegree = async (req, res) => {
  try {
    const success = await litigationDegreesService.deleteLitigationDegree(req.params.id);
    if (success) {
      res.json({ message: 'Litigation degree deleted' });
    } else {
      res.status(404).json({ error: 'Litigation degree not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete litigation degree' });
  }
};

const getLitigationDegreeById = async (req, res) => {
  try {
    const litigationDegree = await litigationDegreesService.getLitigationDegreeById(req.params.id);
    if (litigationDegree) {
      res.json(litigationDegree);
    } else {
      res.status(404).json({ error: 'Litigation degree not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch litigation degree' });
  }
};

const getLitigationDegreesByYear = async (req, res) => {
  try {
    const litigationDegrees = await litigationDegreesService.getLitigationDegreesByYear(req.params.year);
    res.json(litigationDegrees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch litigation degrees by year' });
  }
};

const getLitigationDegreesByCaseNumber = async (req, res) => {
  try {
    const litigationDegrees = await litigationDegreesService.getLitigationDegreesByCaseNumber(req.params.caseNumber);
    res.json(litigationDegrees);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch litigation degrees by case number' });
  }
};

module.exports = {
  getAllLitigationDegrees,
  createLitigationDegree,
  updateLitigationDegree,
  deleteLitigationDegree,
  getLitigationDegreeById,
  getLitigationDegreesByYear,
  getLitigationDegreesByCaseNumber
};