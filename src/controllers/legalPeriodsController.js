const pool = require('../config/db');

// Get all legal periods
const getAllLegalPeriods = async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT * FROM legal_periods ORDER BY created_at DESC'
    );
    res.status(200).json({
      success: true,
      data: rows
    });
  } catch (error) {
    console.error('Error fetching legal periods:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch legal periods',
      details: error.message
    });
  }
};

// Get single legal period by ID
const getLegalPeriodById = async (req, res) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      'SELECT * FROM legal_periods WHERE id = ?',
      [id]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Legal period not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: rows[0]
    });
  } catch (error) {
    console.error('Error fetching legal period:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch legal period',
      details: error.message
    });
  }
};

// Create new legal period
const createLegalPeriod = async (req, res) => {
  try {
    const { name, objection_days, appeal_days, cassation_days } = req.body;
    const created_by = req.employee?.id || null;

    // Validation: name is required
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    // Validation: at least one of the days fields must have a value greater than 0
    const hasValidDays = (objection_days && objection_days > 0) || 
                         (appeal_days && appeal_days > 0) || 
                         (cassation_days && cassation_days > 0);

    if (!hasValidDays) {
      return res.status(400).json({
        success: false,
        error: 'At least one of the days fields (objection_days, appeal_days, cassation_days) must have a value greater than 0'
      });
    }

    const [result] = await pool.query(
      `INSERT INTO legal_periods (name, objection_days, appeal_days, cassation_days, created_by) 
       VALUES (?, ?, ?, ?, ?)`,
      [name, objection_days || null, appeal_days || null, cassation_days || null, created_by]
    );

    const [newPeriod] = await pool.query(
      'SELECT * FROM legal_periods WHERE id = ?',
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newPeriod[0],
      message: 'Legal period created successfully'
    });
  } catch (error) {
    console.error('Error creating legal period:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create legal period',
      details: error.message
    });
  }
};

// Update legal period
const updateLegalPeriod = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, objection_days, appeal_days, cassation_days } = req.body;

    // Check if legal period exists
    const [existing] = await pool.query(
      'SELECT * FROM legal_periods WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Legal period not found'
      });
    }

    // Validation: name is required
    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'Name is required'
      });
    }

    // Validation: at least one of the days fields must have a value greater than 0
    const hasValidDays = (objection_days && objection_days > 0) || 
                         (appeal_days && appeal_days > 0) || 
                         (cassation_days && cassation_days > 0);

    if (!hasValidDays) {
      return res.status(400).json({
        success: false,
        error: 'At least one of the days fields must have a value greater than 0'
      });
    }

    await pool.query(
      `UPDATE legal_periods 
       SET name = ?, objection_days = ?, appeal_days = ?, cassation_days = ?
       WHERE id = ?`,
      [name, objection_days || null, appeal_days || null, cassation_days || null, id]
    );

    const [updatedPeriod] = await pool.query(
      'SELECT * FROM legal_periods WHERE id = ?',
      [id]
    );

    res.status(200).json({
      success: true,
      data: updatedPeriod[0],
      message: 'Legal period updated successfully'
    });
  } catch (error) {
    console.error('Error updating legal period:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update legal period',
      details: error.message
    });
  }
};

// Delete legal period
const deleteLegalPeriod = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if legal period exists
    const [existing] = await pool.query(
      'SELECT * FROM legal_periods WHERE id = ?',
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Legal period not found'
      });
    }

    // Check if legal period is being used in appeals_cassations
    const [usages] = await pool.query(
      'SELECT COUNT(*) as count FROM appeals_cassations WHERE legal_period_id = ?',
      [id]
    );

    if (usages[0].count > 0) {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete legal period as it is being used in appeals/cassations records'
      });
    }

    await pool.query('DELETE FROM legal_periods WHERE id = ?', [id]);

    res.status(200).json({
      success: true,
      message: 'Legal period deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting legal period:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete legal period',
      details: error.message
    });
  }
};

module.exports = {
  getAllLegalPeriods,
  getLegalPeriodById,
  createLegalPeriod,
  updateLegalPeriod,
  deleteLegalPeriod
};
