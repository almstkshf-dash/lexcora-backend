// publicProsecutionsService.js
// Service functions for public prosecutions

const publicProsecutionsModel = require('../models/publicProsecutionsModel');

const getAllPublicProsecutions = async () => {
  return await publicProsecutionsModel.getAllPublicProsecutions();
};

const createPublicProsecution = async (prosecution) => {
  return await publicProsecutionsModel.createPublicProsecution(prosecution);
};

const updatePublicProsecution = async (id, prosecution) => {
  return await publicProsecutionsModel.updatePublicProsecution(id, prosecution);
};

const deletePublicProsecution = async (id) => {
  return await publicProsecutionsModel.deletePublicProsecution(id);
};

module.exports = {
  getAllPublicProsecutions,
  createPublicProsecution,
  updatePublicProsecution,
  deletePublicProsecution
};
