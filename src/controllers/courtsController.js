// courtsController.js
// Controller functions for courts

const courtsService = require('../services/courtsService');

const getAllCourts = async (req, res) => {
  try {
    const courts = await courtsService.getAllCourts();
    res.json({success: true, data: courts});
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch courts' });
  }
};

const getCourtById = async (req, res) => {
  try {
    const court = await courtsService.getCourtById(req.params.id);
    if (court) {
      res.json(court);
    } else {
      res.status(404).json({ error: 'Court not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch court' });
  }
};

const createCourt = async (req, res) => {
  try {
    const { court_ar, court_en } = req.body;
    const createdBy = req.user?.id || null;
    const courtId = await courtsService.createCourt({ court_ar, court_en }, createdBy);
    res.status(201).json({ id: courtId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create court' });
  }
};

const updateCourt = async (req, res) => {
  try {
    const { court_ar, court_en } = req.body;
    const updatedBy = req.user?.id || null;
    const success = await courtsService.updateCourt(req.params.id, { court_ar, court_en }, updatedBy);
    if (success) {
      res.json({ message: 'Court updated successfully' });
    } else {
      res.status(404).json({ error: 'Court not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update court' });
  }
};

const deleteCourt = async (req, res) => {
  try {
    const deletedBy = req.user?.id || null;
    const success = await courtsService.deleteCourt(req.params.id, deletedBy);
    if (success) {
      res.json({ message: 'Court deleted' });
    } else {
      res.status(404).json({ error: 'Court not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete court' });
  }
};

module.exports = {
  getAllCourts,
  getCourtById,
  createCourt,
  updateCourt,
  deleteCourt
};