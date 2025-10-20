const jwt = require('jsonwebtoken');
const { getPartyById } = require('../models/partiesModel');

// JWT Secret - should match the one used in clientAuthService
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-this-in-production';

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Authenticate client token middleware
 */
const authenticateClientToken = async (req, res, next) => {
  try {
    // Get token from cookie first, then fallback to header
    let token = req.cookies?.clientAuthToken;
    
    // If no cookie token, check Authorization header
    if (!token) {
      const authHeader = req.headers['authorization'];
      token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify token
    const decoded = verifyToken(token);
    
    // Get client details from database
    const client = await getPartyById(decoded.id);
    
    if (!client) {
      return res.status(401).json({
        success: false,
        message: 'Client not found'
      });
    }

    // Add client info to request object
    req.user = {
      id: client.id,
      party_id: client.party_id,
      username: client.username,
      name: client.name,
      phone: client.phone,
      email: client.email,
      address: client.address,
      national_id: client.national_id,
      created_at: client.created_at,
      updated_at: client.updated_at
    };

    next();
  } catch (error) {
    console.error('Client authentication error:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token has expired'
      });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    } else {
      return res.status(500).json({
        success: false,
        message: 'Internal server error during authentication'
      });
    }
  }
};

module.exports = {
  authenticateClientToken,
  verifyToken
};
