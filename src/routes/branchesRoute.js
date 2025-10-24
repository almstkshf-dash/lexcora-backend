
const express = require('express');
const router = express.Router();
const branchesController = require('../controllers/branchesController');
const { authenticateToken } = require('../middliewares/authMiddleware');


router.get('/', branchesController.getAllBranches);

router.post('/', authenticateToken, branchesController.createBranch);

router.put('/:id', authenticateToken, branchesController.updateBranch);

router.delete('/:id', authenticateToken, branchesController.deleteBranch);

module.exports = router;
