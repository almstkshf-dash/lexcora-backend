const clientAuthService = require('../services/clientAuthService');
const { getPartyDocuments } = require('../models/partiesModel');
const { getOrdersByPartyId, createPartyOrder } = require('../models/partiesOrdersModel');
const { sendSystemNotification } = require('../utils/notificationHelper');

/**
 * Client Login Controller
 */
const loginClient = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Attempt login using service
    const result = await clientAuthService.loginClient(username, password);

    // Set JWT token in httpOnly cookie
    const cookieOptions = {
      httpOnly: true, // Prevents XSS attacks
      secure: process.env.NODE_ENV === 'production', // true for HTTPS in production
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax', // 'none' for cross-origin HTTPS
      maxAge: 86400000, // 24 hours
      path: '/' 
    };

    res.cookie('clientAuthToken', result.token, cookieOptions);

    // Send token in response body for localStorage AND in cookie
    res.status(200).json({
      ...result,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Client login error:', error.message);
    res.status(401).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Client Logout Controller
 */
const logoutClient = async (req, res) => {
  try {
    // Get token from cookie or header
    const token = req.cookies?.clientAuthToken || req.headers['authorization']?.split(' ')[1];
    
    // Logout using service
    const result = await clientAuthService.logoutClient(token);
    
    // Clear the auth cookie
    res.clearCookie('clientAuthToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/'
    });

    res.status(200).json({
      ...result,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Client logout error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error during logout'
    });
  }
};

/**
 * Get Current Client Profile
 */
const getCurrentClient = async (req, res) => {
  try {
    // User info is available from authentication middleware
    res.status(200).json({
      success: true,
      data: req.user
    });
  } catch (error) {
    console.error('Get current client error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching client profile'
    });
  }
};

/**
 * Get Current Client Documents
 */
const getClientDocuments = async (req, res) => {
  try {
    // Get party ID from authenticated user
    const partyId = req.user.id;
    
    // Fetch documents for this party
    const documents = await getPartyDocuments(partyId);
    
    res.status(200).json({
      success: true,
      data: documents
    });
  } catch (error) {
    console.error('Get client documents error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching documents'
    });
  }
};

/**
 * Get Current Client Orders (Requests)
 */
const getClientRequests = async (req, res) => {
  try {
    // Get party ID from authenticated user
    const partyId = req.user.id;
    
    // Fetch orders for this party
    const orders = await getOrdersByPartyId(partyId);
    
    res.status(200).json({
      success: true,
      data: orders
    });
  } catch (error) {
    console.error('Get client orders error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching requests'
    });
  }
};

/**
 * Create Client Order (Request)
 */
const createClientRequest = async (req, res) => {
  try {
    // Get party ID from authenticated user
    const partyId = req.user.id;
    const partyName = req.user.name || req.user.username || 'Client';
    
    // Map request data to party order structure
    const orderData = {
      party_id: partyId,
      type: req.body.request_type || req.body.type || req.body.request_title || 'Request', // Use request_type first
      date: req.body.request_date || req.body.date || new Date().toISOString().split('T')[0],
      status: 'pending', // Default status
      case_number: req.body.case_number || null,
      details: req.body.request_title || req.body.details || null, // request_title becomes details
      created_by: null // Client created, so no employee ID
    };
    
    // Create the order
    const orderId = await createPartyOrder(orderData);
    
    // Send notification to all employees about new client request
    try {
      await sendSystemNotification({
        title: 'New Client Request',
        message: `New request received from ${partyName}: "${orderData.type}"`,
        type: 'info',
        relatedType: 'none', // Using 'none' to avoid ENUM mismatch
        createdBy: null // Client created this, not an employee
      });
    } catch (notifyError) {
      console.error('Error sending notification for new client request:', notifyError);
      // Don't throw - request creation should succeed even if notification fails
    }
    
    res.status(201).json({
      success: true,
      message: 'Request created successfully',
      data: {
        id: orderId,
        ...orderData
      }
    });
  } catch (error) {
    console.error('Create client order error:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error creating request'
    });
  }
};

/**
 * Get Client Finance Summary
 */
const getClientFinanceSummary = async (req, res) => {
  try {
    const partyId = req.user.id;
    const db = require('../config/db');

    // Use invoices table directly — safer than ledger_entries which may not exist
    const [rows] = await db.query(`
      SELECT
        COALESCE(SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END), 0) AS income,
        COALESCE(SUM(CASE WHEN status != 'paid' THEN amount ELSE 0 END), 0) AS receivable
      FROM invoices
      WHERE client_id = ?
    `, [partyId]);

    const row = rows[0] || {};
    res.status(200).json({
      success: true,
      data: {
        income: parseFloat(row.income) || 0,
        expense: 0,
        profit: parseFloat(row.income) || 0,
        receivable: parseFloat(row.receivable) || 0,
        payable: 0
      }
    });
  } catch (error) {
    console.error('Get client finance summary error:', error.message);
    res.status(200).json({
      success: true,
      data: { income: 0, expense: 0, profit: 0, receivable: 0, payable: 0 },
      warning: 'Could not load finance summary'
    });
  }
};

/**
 * Get Client Invoices
 */
const getClientInvoices = async (req, res) => {
  try {
    const partyId = req.user.id;
    const db = require('../config/db');
    
    // Avoid JOIN on currencies table — it may not exist or column names may differ
    const [invoices] = await db.query(`
      SELECT id, invoice_number, invoice_date, amount, status, currency, client_id
      FROM invoices
      WHERE client_id = ?
      ORDER BY invoice_date DESC
    `, [partyId]);
    
    res.status(200).json({
      success: true,
      data: invoices || []
    });
  } catch (error) {
    console.error('Get client invoices error:', error.message);
    // Return empty array instead of 500 so the UI doesn't crash
    res.status(200).json({
      success: true,
      data: [],
      warning: 'Could not load invoices'
    });
  }
};

module.exports = {
  loginClient,
  logoutClient,
  getCurrentClient,
  getClientDocuments,
  getClientRequests,
  createClientRequest,
  getClientFinanceSummary,
  getClientInvoices
};
