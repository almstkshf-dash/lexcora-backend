const { getPartyByUsername } = require('../models/partiesModel');
const { generateToken } = require('../middliewares/authMiddleware');

/**
 * Client Login Service
 * Authenticates clients from the parties table
 */
const loginClient = async (username, password) => {
  try {
    // Validate input
    if (!username || !password) {
      throw new Error('Username and password are required');
    }

    // Get party by username
    const client = await getPartyByUsername(username);
    
    if (!client) {
      throw new Error('Invalid username or password');
    }

    // Verify password (plain text comparison)
    if (password !== client.password) {
      throw new Error('Invalid username or password');
    }

    // Check if client status is active
    if (client.status !== 'active') {
      throw new Error('Your account is inactive. Please contact support.');
    }

    // Generate token for client
    const tokenPayload = {
      id: client.id,
      username: client.username,
      name: client.name,
      party_type: client.party_type,
      userType: 'client' // Distinguish from employee logins
    };
    
    const token = generateToken(tokenPayload);

    // Return client info (without password) and token
    const { password: _, ...clientWithoutPassword } = client;
    
    return {
      success: true,
      message: 'Login successful',
      client: clientWithoutPassword,
      token,
      expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    };
  } catch (error) {
    throw error;
  }
};

/**
 * Logout Client Service
 */
const logoutClient = async (token) => {
  try {
    // In production, you might want to:
    // 1. Add the token to a blacklist (Redis recommended)
    // 2. Clear any server-side sessions
    // 3. Log the logout event
    
    return {
      success: true,
      message: 'Logged out successfully'
    };
  } catch (error) {
    throw error;
  }
};

module.exports = {
  loginClient,
  logoutClient
};
