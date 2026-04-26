const db = require("../config/db");

/**
 * Get all cases for a specific party (lightweight version)
 * Returns only essential case fields: id, case_number, file_number, topic
 * 
 * @param {number} partyId - The ID of the party
 * @returns {Promise<Array>} Array of cases with limited fields
 */
const getPartyCasesLight = async (partyId) => {
  try {
    const [rows] = await db.query(`
      SELECT 
        c.id,
        c.case_number,
        c.file_number,
        c.topic,
        c.is_important,
        c.is_secret,
        c.is_archived,
        c.is_pending
      FROM cases c
      JOIN case_parties cp ON c.id = cp.case_id
      WHERE cp.party_id = ?
      ORDER BY c.created_at DESC
    `, [partyId]);
    
    return rows;
  } catch (error) {
    console.error("Error getting party cases (light):", error);
    throw error;
  }
};

module.exports = {
  getPartyCasesLight
};
