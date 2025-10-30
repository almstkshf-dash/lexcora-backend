// casesRoute.js
// Routes for cases

const express = require('express');
const router = express.Router();
const casesController = require('../controllers/casesController');
const { authenticateToken } = require('../middliewares/authMiddleware');

// Get all cases
router.get('/', casesController.getAllCases);

// Search cases for add new case page
router.get('/search', casesController.searchCasesForAddNewCasePage);

// Get case by ID
router.get('/:id', casesController.getCaseById);

// Get all case details (comprehensive information)
router.get('/all-details/:id', casesController.getAllCaseDetails);

// Get cases by branch
router.get('/branch/:branchId', casesController.getCasesByBranch);

// Get cases by lawyer
router.get('/lawyer/:lawyerId', casesController.getCasesByLawyer);

// Get cases by legal advisor
router.get('/legal-advisor/:legalAdvisorId', casesController.getCasesByLegalAdvisor);

// Get cases by legal researcher
router.get('/legal-researcher/:legalResearcherId', casesController.getCasesByLegalResearcher);

// Create a new case
router.post('/', authenticateToken, casesController.addCase);

// Add party to case
router.post('/:caseId/add-party', authenticateToken, casesController.addPartyToCase);

// Delete party from case
router.delete('/:caseId/party/:partyId', authenticateToken, casesController.deletePartyFromCase);

// Get case sessions
router.get('/:caseId/sessions', casesController.getCaseSessions);

// Get case parties
router.get('/:caseId/parties', casesController.getCaseParties);

// Get employees case documents
router.get('/:id/employees-documents', casesController.getEmployeesCaseDocuments);

// Delete specific employee case document
router.delete('/:id/employees-documents/:documentId', authenticateToken, casesController.deleteEmployeeCaseDocument);

// Get case documents
router.get('/:id/documents', casesController.getCaseDocuments);

// Delete specific case document
router.delete('/:id/documents/:documentId', authenticateToken, casesController.deleteCaseDocument);

// Get case court documents
router.get('/:id/court-documents', casesController.getCaseCourtDocuments);

// Delete specific case court document
router.delete('/:id/court-documents/:documentId', authenticateToken, casesController.deleteCaseCourtDocument);

// Get case party documents
router.get('/:id/party-documents/:partyId', casesController.getCasePartyDocuments);

// Add case party documents
router.post('/:id/party-documents/:partyId', authenticateToken, casesController.addCasePartyDocument);

// Delete specific case party document
router.delete('/:id/party-documents/:partyId/:documentId', authenticateToken, casesController.deleteCasePartyDocument);

// Update a case by ID
router.put('/:id', authenticateToken, casesController.updateCase);

// Update case additional note only
router.patch('/:id/additional-note', authenticateToken, casesController.updateCaseAdditionalNote);

// Delete a case by ID
router.delete('/:id', authenticateToken, casesController.deleteCase);

module.exports = router;
