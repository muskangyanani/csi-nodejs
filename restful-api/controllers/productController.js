const productStore = require('../data/productStore');
const Product = require('../models/Product');

class ProductController {
  // GET /api/products
  async getAllProducts(req, res) {
    try {
      const filters = req.query;
      const products = productStore.findAll(filters);
      res.status(200).json({
        success: true,
        count: products.length,
        data: products
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving products',
        error: error.message
      });
    }
  }

  // GET /api/products/:id
  async getProductById(req, res) {
    try {
      const { id } = req.params;
      const product = productStore.findById(id);

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.status(200).json({
        success: true,
        data: product
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving product',
        error: error.message
      });
    }
  }

  // POST /api/products
  async createProduct(req, res) {
    try {
      const productData = req.body;
      const product = new Product(productData);
      const validationErrors = product.validate();

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      const newProduct = productStore.create(productData);

      res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: newProduct
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating product',
        error: error.message
      });
    }
  }

  // PUT /api/products/:id
  async updateProduct(req, res) {
    try {
      const { id } = req.params;
      const productData = req.body;

      const existingProduct = productStore.findById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      const tempProduct = new Product({ ...existingProduct, ...productData });
      const validationErrors = tempProduct.validate();

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      const updatedProduct = productStore.update(id, productData);

      res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: updatedProduct
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating product',
        error: error.message
      });
    }
  }

  // DELETE /api/products/:id
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      const deletedProduct = productStore.delete(id);

      if (!deletedProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
        data: deletedProduct
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting product',
        error: error.message
      });
    }
  }

  // GET /api/products/stats
  async getProductStats(req, res) {
    try {
      const products = productStore.findAll();
      const categories = productStore.getCategories();

      const stats = {
        totalProducts: products.length,
        availableProducts: products.filter(p => p.inStock).length,
        categoriesCount: categories.length,
        categories
      };

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving product statistics',
        error: error.message
      });
    }
  }
}

module.exports = new ProductController();

