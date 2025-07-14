const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticateToken, requireAdmin, requireOwnershipOrAdmin } = require('../middleware/auth');

// Admin-only routes
router.get('/stats', authenticateToken, requireAdmin, userController.getUserStats);
router.get('/', authenticateToken, requireAdmin, userController.getAllUsers);
router.post('/', authenticateToken, requireAdmin, userController.createUser);
router.delete('/:id', authenticateToken, requireAdmin, userController.deleteUser);
router.post('/:id/activate', authenticateToken, requireAdmin, userController.activateUser);
router.post('/:id/deactivate', authenticateToken, requireAdmin, userController.deactivateUser);

// Admin or owner routes
router.get('/:id', authenticateToken, requireOwnershipOrAdmin, userController.getUserById);
router.put('/:id', authenticateToken, requireOwnershipOrAdmin, userController.updateUser);

module.exports = router;
