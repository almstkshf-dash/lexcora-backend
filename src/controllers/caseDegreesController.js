// caseDegreesController.js
// Controller functions for case degrees

const caseDegreesService = require('../services/caseDegreesService');

// Get all case degrees
const getAllCaseDegrees = async (req, res) => {
  try {
    const caseDegrees = await caseDegreesService.getAllCaseDegrees();
    res.json({ success: true, data: caseDegrees });
  } catch (error) {
    console.error('Error fetching case degrees:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch case degrees' 
    });
  }
};

// Get case degree by ID
const getCaseDegreeById = async (req, res) => {
  try {
    const caseDegree = await caseDegreesService.getCaseDegreeById(req.params.id);
    if (caseDegree) {
      res.json({ success: true, data: caseDegree });
    } else {
      res.status(404).json({ 
        success: false, 
        error: 'Case degree not found' 
      });
    }
  } catch (error) {
    console.error('Error fetching case degree:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch case degree' 
    });
  }
};

// Get case degrees by case ID
const getCaseDegreesByCaseId = async (req, res) => {
  try {
    const caseDegrees = await caseDegreesService.getCaseDegreesByCaseId(req.params.caseId);
    res.json({ success: true, data: caseDegrees });
  } catch (error) {
    console.error('Error fetching case degrees by case ID:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch case degrees for case' 
    });
  }
};

// Create new case degree
const createCaseDegree = async (req, res) => {
  try {
    const {
      case_id,
      degree,
      case_number,
      year,
      referral_date
    } = req.body;

    if (!case_id || !degree) {
      return res.status(400).json({
        success: false,
        error: 'Case ID and degree are required'
      });
    }

    const caseDegreeData = {
      case_id,
      degree,
      case_number,
      year,
      referral_date
    };

    const newCaseDegree = await caseDegreesService.createCaseDegree(caseDegreeData);
    res.status(201).json({ 
      success: true, 
      data: newCaseDegree,
      message: 'Case degree created successfully' 
    });
  } catch (error) {
    console.error('Error creating case degree:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to create case degree' 
    });
  }
};

// Update case degree
const updateCaseDegree = async (req, res) => {
  try {
    const {
      case_id,
      degree,
      case_number,
      year,
      referral_date
    } = req.body;

    const caseDegreeData = {
      case_id,
      degree,
      case_number,
      year,
      referral_date
    };

    const updated = await caseDegreesService.updateCaseDegree(req.params.id, caseDegreeData);
    
    if (updated) {
      res.json({ 
        success: true, 
        message: 'Case degree updated successfully' 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        error: 'Case degree not found' 
      });
    }
  } catch (error) {
    console.error('Error updating case degree:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to update case degree' 
    });
  }
};

// Delete case degree
const deleteCaseDegree = async (req, res) => {
  try {
    const deleted = await caseDegreesService.deleteCaseDegree(req.params.id);
    
    if (deleted) {
      res.json({ 
        success: true, 
        message: 'Case degree deleted successfully' 
      });
    } else {
      res.status(404).json({ 
        success: false, 
        error: 'Case degree not found' 
      });
    }
  } catch (error) {
    console.error('Error deleting case degree:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to delete case degree' 
    });
  }
};

// Search case degrees
const searchCaseDegrees = async (req, res) => {
  try {
    const { q } = req.query;
    
    if (!q) {
      return res.status(400).json({
        success: false,
        error: 'Search query is required'
      });
    }

    const caseDegrees = await caseDegreesService.searchCaseDegrees(q);
    res.json({ success: true, data: caseDegrees });
  } catch (error) {
    console.error('Error searching case degrees:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to search case degrees' 
    });
  }
};

module.exports = {
  getAllCaseDegrees,
  getCaseDegreeById,
  getCaseDegreesByCaseId,
  createCaseDegree,
  updateCaseDegree,
  deleteCaseDegree,
  searchCaseDegrees
};