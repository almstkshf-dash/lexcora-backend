const externalLinksModel = require('../models/externalLinksModel');

// Get all external links
const getAllExternalLinks = async () => {
  try {
    const links = await externalLinksModel.getAllExternalLinks();
    return links;
  } catch (error) {
    throw error;
  }
};

// Create a new external link
const createExternalLink = async (linkData) => {
  try {
    const result = await externalLinksModel.createExternalLink(linkData);
    return result;
  } catch (error) {
    throw error;
  }
};

// Delete an external link
const deleteExternalLink = async (id) => {
  try {
    const result = await externalLinksModel.deleteExternalLink(id);
    return result;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getAllExternalLinks,
  createExternalLink,
  deleteExternalLink
};
