
const express = require('express');
const router = express.Router();
const branchesController = require('../controllers/branchesController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { checkPermission } = require('../middlewares/permissionsMiddleware');


router.get('/', authenticateToken, checkPermission('view_branches'), branchesController.getAllBranches);

router.post('/', authenticateToken, checkPermission('Add Branch'), branchesController.createBranch);

router.put('/:id', authenticateToken, checkPermission('Update Branch'), branchesController.updateBranch);

router.delete('/:id', authenticateToken, checkPermission('Delete Branch'), branchesController.deleteBranch);

module.exports = router;

