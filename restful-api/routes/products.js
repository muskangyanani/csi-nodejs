const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// GET /api/products/stats - Get product statistics (must be before /:id)
router.get('/stats', productController.getProductStats);

// GET /api/products - Get all products
router.get('/', productController.getAllProducts);

// GET /api/products/:id - Get product by ID
router.get('/:id', productController.getProductById);

// POST /api/products - Create new product
router.post('/', productController.createProduct);

// PUT /api/products/:id - Update product by ID
router.put('/:id', productController.updateProduct);

// DELETE /api/products/:id - Delete product by ID
router.delete('/:id', productController.deleteProduct);

module.exports = router;

