const publicProsecutionsService = require('../services/publicProsecutionsService');

const getAllPublicProsecutions = async (req, res) => {
  try {
    const prosecutions = await publicProsecutionsService.getAllPublicProsecutions();
    res.json(prosecutions);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch public prosecutions' });
  }
};

const createPublicProsecution = async (req, res) => {
  try {
    const prosecutionId = await publicProsecutionsService.createPublicProsecution(req.body);
    res.status(201).json({ id: prosecutionId });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create public prosecution' });
  }
};

const updatePublicProsecution = async (req, res) => {
  try {
    const success = await publicProsecutionsService.updatePublicProsecution(req.params.id, req.body);
    if (success) {
      res.json({ message: 'Public prosecution updated' });
    } else {
      res.status(404).json({ error: 'Public prosecution not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to update public prosecution' });
  }
};

const deletePublicProsecution = async (req, res) => {
  try {
    const success = await publicProsecutionsService.deletePublicProsecution(req.params.id);
    if (success) {
      res.json({ message: 'Public prosecution deleted' });
    } else {
      res.status(404).json({ error: 'Public prosecution not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete public prosecution' });
  }
};

module.exports = {
  getAllPublicProsecutions,
  createPublicProsecution,
  updatePublicProsecution,
  deletePublicProsecution
};