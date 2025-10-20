const externalLinksService = require('../services/externalLinksService');

// Get all external links
const getAllExternalLinks = async (req, res) => {
  try {
    const links = await externalLinksService.getAllExternalLinks();
    
    res.status(200).json({
      success: true,
      data: links
    });
  } catch (error) {
    console.error('Error fetching external links:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching external links',
      error: error.message
    });
  }
};

// Create a new external link
const createExternalLink = async (req, res) => {
  try {
    const { title, link } = req.body;
    
    // Validation
    if (!title || !link) {
      return res.status(400).json({
        success: false,
        message: 'Title and link are required'
      });
    }
    
    const linkData = {
      title,
      link,
      created_by: req.user?.id || null
    };
    
    const result = await externalLinksService.createExternalLink(linkData);
    
    res.status(201).json({
      success: true,
      message: 'External link created successfully',
      data: { id: result.insertId }
    });
  } catch (error) {
    console.error('Error creating external link:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating external link',
      error: error.message
    });
  }
};

// Delete an external link
const deleteExternalLink = async (req, res) => {
  try {
    const { id } = req.params;
    
    if (!id) {
      return res.status(400).json({
        success: false,
        message: 'Link ID is required'
      });
    }
    
    const result = await externalLinksService.deleteExternalLink(id);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: 'External link not found'
      });
    }
    
    res.status(200).json({
      success: true,
      message: 'External link deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting external link:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting external link',
      error: error.message
    });
  }
};

module.exports = {
  getAllExternalLinks,
  createExternalLink,
  deleteExternalLink
};
