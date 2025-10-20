const { getCaseById } = require('../models/casesModel');
const { getPartyCasesLight } = require('../models/partyCasesModel');
const { getSessionsByCase } = require('../models/sessionsModel');

/**
 * Get Client Cases
 * Returns all cases for the authenticated client (lightweight version)
 * Only returns: id, case_number, file_number, topic
 */
const getClientCases = async (req, res) => {
  try {
    // Get client ID from authenticated user (set by authMiddleware)
    const clientId = req.user.id;

    if (!clientId) {
      return res.status(401).json({
        success: false,
        message: 'Client not authenticated'
      });
    }

    // Get cases for this client/party (lightweight version)
    const cases = await getPartyCasesLight(clientId);

    res.status(200).json({
      success: true,
      data: cases,
      total: cases.length
    });
  } catch (error) {
    console.error('Error fetching client cases:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching cases'
    });
  }
};

/**
 * Get Client Case by ID
 * Returns detailed information about a specific case including sessions
 */
const getClientCaseById = async (req, res) => {
  try {
    const { id } = req.params;
    const clientId = req.user.id;

    if (!clientId) {
      return res.status(401).json({
        success: false,
        message: 'Client not authenticated'
      });
    }

    // Get case details
    const caseDetails = await getCaseById(id);

    if (!caseDetails) {
      return res.status(404).json({
        success: false,
        message: 'Case not found'
      });
    }

    // Verify that this client is associated with this case
    const clientCases = await getPartyCasesLight(clientId);
    const hasAccess = clientCases.some(c => c.id === parseInt(id));

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: 'Access denied to this case'
      });
    }

    // Get sessions for this case
    const sessions = await getSessionsByCase(id);

    // Combine case details with sessions
    const fullCaseData = {
      ...caseDetails,
      sessions: sessions || []
    };

    res.status(200).json({
      success: true,
      data: fullCaseData
    });
  } catch (error) {
    console.error('Error fetching client case details:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching case details'
    });
  }
};

module.exports = {
  getClientCases,
  getClientCaseById
};
