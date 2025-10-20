// casesController.js
// Controller functions for cases

const casesService = require('../services/casesService');

const addCase = async (req, res) => {
  try {
    // Get employee ID from authenticated user
    const createdBy = req.user ? req.user.id : null;
    
    // Prepare case data from request body
    const caseData = req.body;
  
    
    const result = await casesService.addCase(caseData, createdBy);
    
    // Return success response with case data and uploaded files info
    res.status(201).json({
      success: true,
      message: 'Case created successfully',
      caseId: result,
    });
  } catch (error) {
    console.error('Error creating case:', error);
    res.status(500).json({ 
      success: false,
      error: 'Failed to create case',
      message: error.message 
    });
  }
};

const getAllCases = async (req, res) => {
  try {
    const { page, limit, branchId, fromDate, toDate, fileNumber, caseNumber } = req.query;
    
    const filters = {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
      branchId,
      fromDate,
      toDate,
      fileNumber,
      caseNumber
    };
    
    const result = await casesService.getAllCases(filters);
    res.json({
      success: true, 
      data: result.cases,
      pagination: result.pagination
    });
  } catch (error) {
    console.error('Error fetching cases:', error);
    res.status(500).json({ success: false, error: 'Failed to fetch cases' });
  }
};

const getCaseById = async (req, res) => {
  try {
    const case_data = await casesService.getCaseById(req.params.id);
    if (case_data) {
      res.json({ success: true, data: case_data });
    } else {
      res.status(404).json({ success: false, error: 'Case not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: 'Failed to fetch case' });
  }
};

const getAllCaseDetails = async (req, res) => {
  try {
    const caseId = req.params.id;
    
    if (!caseId) {
      return res.status(400).json({
        success: false,
        error: 'Case ID is required'
      });
    }

    const caseDetails = await casesService.getAllCaseDetails(caseId);
    
    if (caseDetails) {
      res.json({
        success: true,
        data: caseDetails,
        message: 'Case details retrieved successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Case not found'
      });
    }
  } catch (error) {
    console.error('Error fetching case details:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch case details',
      message: error.message
    });
  }
};

const updateCase = async (req, res) => {
  try {
    const updatedBy = req.user ? req.user.id : null;
    const success = await casesService.updateCase(req.params.id, req.body, updatedBy);
    if (success) {
      res.json({ message: 'Case updated successfully' });
    } else {
      res.status(404).json({ error: 'Case not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update case' });
  }
};

const deleteCase = async (req, res) => {
  try {
    const deletedBy = req.user ? req.user.id : null;
    const success = await casesService.deleteCase(req.params.id, deletedBy);
    if (success) {
      res.json({ message: 'Case deleted successfully' });
    } else {
      res.status(404).json({ error: 'Case not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete case' });
  }
};

const getCasesByBranch = async (req, res) => {
  try {
    const cases = await casesService.getCasesByBranch(req.params.branchId);
    res.json(cases);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cases by branch' });
  }
};

const getCasesByLawyer = async (req, res) => {
  try {
    const cases = await casesService.getCasesByLawyer(req.params.lawyerId);
    res.json(cases);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cases by lawyer' });
  }
};

const getCasesByLegalAdvisor = async (req, res) => {
  try {
    const cases = await casesService.getCasesByLegalAdvisor(req.params.legalAdvisorId);
    res.json(cases);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cases by legal advisor' });
  }
};

const getCasesByLegalResearcher = async (req, res) => {
  try {
    const cases = await casesService.getCasesByLegalResearcher(req.params.legalResearcherId);
    res.json(cases);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch cases by legal researcher' });
  }
};

const addPartyToCase = async (req, res) => {
  try {
    const { caseId } = req.params;
    const partyData = req.body;
    console.log("Received partyData:", partyData);

    // Validate required fields
    if (!partyData.party_id || !partyData.type) {
      return res.status(400).json({
        success: false,
        error: 'id and type are required'
      });
    }

    // Validate type field
    if (!['client', 'opponent'].includes(partyData.type)) {
      return res.status(400).json({
        success: false,
        error: 'type must be either "client" or "opponent"'
      });
    }

    const result = await casesService.addCaseParty(caseId, partyData);
    
    res.status(201).json({
      success: true,
      message: 'Party added to case successfully',
      data: result
    });
  } catch (error) {
    console.error('Error adding party to case:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add party to case',
      message: error.message
    });
  }
};

const deletePartyFromCase = async (req, res) => {
  try {
    const { caseId, partyId } = req.params;

    // Validate required parameters
    if (!caseId || !partyId) {
      return res.status(400).json({
        success: false,
        error: 'caseId and partyId are required'
      });
    }

    const result = await casesService.deleteCaseParty(caseId, partyId);
    
    res.status(200).json({
      success: true,
      message: 'Party removed from case successfully',
      data: result
    });
  } catch (error) {
    console.error('Error deleting party from case:', error);
    
    if (error.message === 'Party not found in case') {
      return res.status(404).json({
        success: false,
        error: 'Party not found in case'
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'Failed to delete party from case',
      message: error.message
    });
  }
};

const searchCasesForAddNewCasePage = async (req, res) => {
  try {
    const { searchTerm } = req.query;
    
    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        error: 'Search term is required'
      });
    }

    const cases = await casesService.searchCasesForAddNewCasePage(searchTerm);
    res.json({
      success: true,
      data: cases
    });
  } catch (error) {
    console.error('Error searching cases for add new case page:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to search cases',
      message: error.message
    });
  }
};

const getCaseSessions = async (req, res) => {
  try {
    const { caseId } = req.params;
    
    if (!caseId) {
      return res.status(400).json({
        success: false,
        error: 'Case ID is required'
      });
    }

    const sessionsService = require('../services/sessionsService');
    const sessions = await sessionsService.getSessionsByCase(caseId);
    
    res.json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Error fetching case sessions:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch case sessions',
      message: error.message
    });
  }
};

const getCaseParties = async (req, res) => {
  try {
    const { caseId } = req.params;
    
    if (!caseId) {
      return res.status(400).json({
        success: false,
        error: 'Case ID is required'
      });
    }

    const parties = await casesService.getCaseParties(caseId);
    
    res.json({
      success: true,
      data: parties
    });
  } catch (error) {
    console.error('Error fetching case parties:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch case parties',
      message: error.message
    });
  }
};

const getEmployeesCaseDocuments = async (req, res) => {
  try {
    const caseId = req.params.id;
    const documents = await casesService.getEmployeesCaseDocuments(caseId);
    res.json({
      success: true,
      data: documents,
      message: 'Employee case documents retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching employee case documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch employee case documents',
      message: error.message
    });
  }
};

const deleteEmployeeCaseDocument = async (req, res) => {
  try {
    const caseId = req.params.id;
    const documentId = req.params.documentId;
    const isDeleted = await casesService.deleteEmployeeCaseDocument(caseId, documentId);
    
    if (isDeleted) {
      res.json({
        success: true,
        message: 'Employee case document deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Employee case document not found'
      });
    }
  } catch (error) {
    console.error('Error deleting employee case document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete employee case document',
      message: error.message
    });
  }
};

const getCaseDocuments = async (req, res) => {
  try {
    const caseId = req.params.id;
    const documents = await casesService.getCaseDocuments(caseId);
    res.json({
      success: true,
      data: documents,
      message: 'Case documents retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching case documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch case documents',
      message: error.message
    });
  }
};

const deleteCaseDocument = async (req, res) => {
  try {
    const caseId = req.params.id;
    const documentId = req.params.documentId;
    const isDeleted = await casesService.deleteCaseDocument(caseId, documentId);
    
    if (isDeleted) {
      res.json({
        success: true,
        message: 'Case document deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Case document not found'
      });
    }
  } catch (error) {
    console.error('Error deleting case document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete case document',
      message: error.message
    });
  }
};

const getCaseCourtDocuments = async (req, res) => {
  try {
    const caseId = req.params.id;
    const documents = await casesService.getCaseCourtDocuments(caseId);
    res.json({
      success: true,
      data: documents,
      message: 'Case court documents retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching case court documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch case court documents',
      message: error.message
    });
  }
};

const deleteCaseCourtDocument = async (req, res) => {
  try {
    const caseId = req.params.id;
    const documentId = req.params.documentId;
    const isDeleted = await casesService.deleteCaseCourtDocument(caseId, documentId);
    
    if (isDeleted) {
      res.json({
        success: true,
        message: 'Case court document deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Case court document not found'
      });
    }
  } catch (error) {
    console.error('Error deleting case court document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete case court document',
      message: error.message
    });
  }
};

const getCasePartyDocuments = async (req, res) => {
  try {
    const caseId = req.params.id;
    const partyId = req.params.partyId;
    const documents = await casesService.getCasePartyDocuments(caseId, partyId);
    res.json({
      success: true,
      data: documents,
      message: 'Case party documents retrieved successfully'
    });
  } catch (error) {
    console.error('Error fetching case party documents:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch case party documents',
      message: error.message
    });
  }
};

const deleteCasePartyDocument = async (req, res) => {
  try {
    const caseId = req.params.id;
    const partyId = req.params.partyId;
    const documentId = req.params.documentId;
    const isDeleted = await casesService.deleteCasePartyDocument(caseId, partyId, documentId);
    
    if (isDeleted) {
      res.json({
        success: true,
        message: 'Case party document deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        error: 'Case party document not found'
      });
    }
  } catch (error) {
    console.error('Error deleting case party document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete case party document',
      message: error.message
    });
  }
};

const addCasePartyDocument = async (req, res) => {
  try {
    const { id: caseId, partyId } = req.params;
    
    // Check if files are provided (they come from the upload middleware)
    if (!req.body.files || req.body.files.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No files provided for upload'
      });
    }

    const documentData = {
      files: req.body.files
    };

    const result = await casesService.addCasePartyDocument(caseId, partyId, documentData);
    
    res.status(201).json({
      success: true,
      message: 'Case party documents added successfully',
      data: result
    });
  } catch (error) {
    console.error('Error adding case party document:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to add case party document',
      message: error.message
    });
  }
};

module.exports = {
  addCase,
  getAllCases,
  getCaseById,
  getAllCaseDetails,
  updateCase,
  deleteCase,
  getCasesByBranch,
  getCasesByLawyer,
  getCasesByLegalAdvisor,
  getCasesByLegalResearcher,
  addPartyToCase,
  deletePartyFromCase,
  searchCasesForAddNewCasePage,
  getCaseSessions,
  getCaseParties,
  getEmployeesCaseDocuments,
  deleteEmployeeCaseDocument,
  getCaseDocuments,
  deleteCaseDocument,
  getCaseCourtDocuments,
  deleteCaseCourtDocument,
  getCasePartyDocuments,
  deleteCasePartyDocument,
  addCasePartyDocument,
};
