// casePetitionsController.js
// Controller functions for case petitions

const casePetitionsService = require('../services/casePetitionsService');

const addCasePetition = async (req, res) => {
  try {
    const petitionData = req.body;
    const result = await casePetitionsService.addCasePetition(petitionData);
    
    res.status(201).json({
      success: true,
      message: 'Case petition created successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error creating case petition:', error);
    res.status(400).json({ 
      success: false,
      error: 'Failed to create case petition',
      message: error.message 
    });
  }
};

const getAllCasePetitions = async (req, res) => {
  try {
    const petitions = await casePetitionsService.getAllCasePetitions();
    res.json({
      success: true, 
      data: petitions
    });
  } catch (error) {
    console.error('Error fetching case petitions:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch case petitions',
      message: error.message 
    });
  }
};

const getCasePetitionById = async (req, res) => {
  try {
    const petition = await casePetitionsService.getCasePetitionById(req.params.id);
    res.json({
      success: true,
      data: petition
    });
  } catch (error) {
    console.error('Error fetching case petition:', error);
    if (error.message === 'Case petition not found') {
      res.status(404).json({ 
        success: false, 
        error: 'Case petition not found' 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Failed to fetch case petition',
        message: error.message 
      });
    }
  }
};

const getCasePetitionsByCaseId = async (req, res) => {
  try {
    const petitions = await casePetitionsService.getCasePetitionsByCaseId(req.params.caseId);
    res.json({
      success: true,
      data: petitions
    });
  } catch (error) {
    console.error('Error fetching case petitions by case ID:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Failed to fetch case petitions',
      message: error.message 
    });
  }
};

const updateCasePetition = async (req, res) => {
  try {
    const updatedPetition = await casePetitionsService.updateCasePetition(req.params.id, req.body);
    res.json({
      success: true,
      message: 'Case petition updated successfully',
      data: updatedPetition
    });
  } catch (error) {
    console.error('Error updating case petition:', error);
    if (error.message === 'Case petition not found') {
      res.status(404).json({ 
        success: false, 
        error: 'Case petition not found' 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Failed to update case petition',
        message: error.message 
      });
    }
  }
};

const deleteCasePetition = async (req, res) => {
  try {
    const result = await casePetitionsService.deleteCasePetition(req.params.id);
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error deleting case petition:', error);
    if (error.message === 'Case petition not found') {
      res.status(404).json({ 
        success: false, 
        error: 'Case petition not found' 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Failed to delete case petition',
        message: error.message 
      });
    }
  }
};

const getCasePetitionsByDecision = async (req, res) => {
  try {
    const petitions = await casePetitionsService.getCasePetitionsByDecision(req.params.decision);
    res.json({
      success: true,
      data: petitions
    });
  } catch (error) {
    console.error('Error fetching case petitions by decision:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Failed to fetch case petitions',
      message: error.message 
    });
  }
};

const getCasePetitionsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    const petitions = await casePetitionsService.getCasePetitionsByDateRange(startDate, endDate);
    res.json({
      success: true,
      data: petitions
    });
  } catch (error) {
    console.error('Error fetching case petitions by date range:', error);
    res.status(400).json({ 
      success: false, 
      error: 'Failed to fetch case petitions',
      message: error.message 
    });
  }
};

const getCasePetitionStatistics = async (req, res) => {
  try {
    const statistics = await casePetitionsService.getCasePetitionStatistics();
    res.json({
      success: true,
      data: statistics
    });
  } catch (error) {
    console.error('Error fetching case petition statistics:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch statistics',
      message: error.message 
    });
  }
};

const deleteCasePetitionDocument = async (req, res) => {
  try {
    const result = await casePetitionsService.deleteCasePetitionDocument(req.params.documentId);
    res.json({
      success: true,
      message: result.message
    });
  } catch (error) {
    console.error('Error deleting case petition document:', error);
    if (error.message === 'Case petition document not found') {
      res.status(404).json({ 
        success: false, 
        error: 'Case petition document not found' 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: 'Failed to delete case petition document',
        message: error.message 
      });
    }
  }
};

module.exports = {
  addCasePetition,
  getAllCasePetitions,
  getCasePetitionById,
  getCasePetitionsByCaseId,
  updateCasePetition,
  deleteCasePetition,
  getCasePetitionsByDecision,
  getCasePetitionsByDateRange,
  getCasePetitionStatistics,
  deleteCasePetitionDocument,
};