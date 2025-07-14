const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken, optionalAuth } = require('../middleware/auth');

// Public routes with optional authentication
router.get('/categories', productController.getCategories);
router.get('/category/:category', productController.getProductsByCategory);
router.get('/', optionalAuth, productController.getAllProducts);
router.get('/:id', optionalAuth, productController.getProductById);

// Protected routes - require authentication
router.get('/stats', authenticateToken, productController.getProductStats);
router.get('/my', authenticateToken, productController.getMyProducts);
router.post('/', authenticateToken, productController.createProduct);
router.put('/:id', authenticateToken, productController.updateProduct);
router.delete('/:id', authenticateToken, productController.deleteProduct);

module.exports = router;
