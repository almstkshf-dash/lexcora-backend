const jwt = require('jsonwebtoken');
const db = require('../config/db');

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
    // Get token from Authorization header first, then cookie
    let token = null;
    const authHeader = req.headers['authorization'];
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    }
    if (!token) {
      token = req.cookies?.clientAuthToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token is required'
      });
    }

    // Verify token
    const decoded = verifyToken(token);

    // Lightweight query — only fetch what we need, no JOINs that can fail
    const [rows] = await db.query(
      'SELECT id, name, username, phone, email, address, national_id, status, created_at, updated_at FROM parties WHERE id = ?',
      [decoded.id]
    );

    const client = rows[0];
    if (!client) {
      return res.status(401).json({
        success: false,
        message: 'Client not found'
      });
    }

    req.user = {
      id: client.id,
      username: client.username,
      name: client.name,
      phone: client.phone,
      email: client.email,
      address: client.address,
      national_id: client.national_id,
      status: client.status,
      created_at: client.created_at,
      updated_at: client.updated_at
    };

    next();
  } catch (error) {
    console.error('Client authentication error:', error.message);

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ success: false, message: 'Token has expired' });
    }
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }
    // DB errors — return 401 not 500 so the portal redirects to login cleanly
    return res.status(401).json({ success: false, message: 'Authentication failed' });
  }
};

module.exports = {
  authenticateClientToken,
  verifyToken
};
