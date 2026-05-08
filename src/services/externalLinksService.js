const externalLinksModel = require('../models/externalLinksModel');

// Get all external links
const getAllExternalLinks = async () => {
  return await externalLinksModel.getAllExternalLinks();
};

// Create a new external link
const createExternalLink = async (linkData) => {
  return await externalLinksModel.createExternalLink(linkData);
};

// Delete an external link
const deleteExternalLink = async (id) => {
  return await externalLinksModel.deleteExternalLink(id);
};

module.exports = {
  getAllExternalLinks,
  createExternalLink,
  deleteExternalLink
};
