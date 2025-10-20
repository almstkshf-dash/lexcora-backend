// publicProsecutionsRoute.js
// Routes for public prosecutions

const express = require('express');
const router = express.Router();
const publicProsecutionsController = require('../controllers/publicProsecutionsController');

// Get all public prosecutions
router.get('/', publicProsecutionsController.getAllPublicProsecutions);

// Create a new public prosecution
router.post('/', publicProsecutionsController.createPublicProsecution);

// Update a public prosecution by ID
router.put('/:id', publicProsecutionsController.updatePublicProsecution);

// Delete a public prosecution by ID
router.delete('/:id', publicProsecutionsController.deletePublicProsecution);

module.exports = router;