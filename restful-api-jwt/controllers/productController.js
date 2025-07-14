const productStore = require('../data/productStore');
const Product = require('../models/Product');

class ProductController {
  // GET /api/products (Public - optional auth for enhanced data)
  async getAllProducts(req, res) {
    try {
      const filters = req.query;
      const products = productStore.findAll(filters);
      
      res.status(200).json({
        success: true,
        count: products.length,
        data: products,
        authenticated: !!req.user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving products',
        error: error.message
      });
    }
  }

  // GET /api/products/:id (Public - optional auth)
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
        data: product,
        canModify: req.user ? productStore.canModify(id, req.user.id, req.user.role) : false
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving product',
        error: error.message
      });
    }
  }

  // POST /api/products (Authenticated users only)
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

      const newProduct = productStore.create(productData, req.user.id);

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

  // PUT /api/products/:id (Owner or admin only)
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

      // Check if user can modify this product
      if (!productStore.canModify(id, req.user.id, req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'You can only modify products you created'
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

  // DELETE /api/products/:id (Owner or admin only)
  async deleteProduct(req, res) {
    try {
      const { id } = req.params;
      
      const existingProduct = productStore.findById(id);
      if (!existingProduct) {
        return res.status(404).json({
          success: false,
          message: 'Product not found'
        });
      }

      // Check if user can modify this product
      if (!productStore.canModify(id, req.user.id, req.user.role)) {
        return res.status(403).json({
          success: false,
          message: 'You can only delete products you created'
        });
      }

      const deletedProduct = productStore.delete(id);

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

  // GET /api/products/stats (Authenticated users)
  async getProductStats(req, res) {
    try {
      const products = productStore.findAll();
      const myProducts = req.user ? productStore.findByCreator(req.user.id) : [];
      const categories = productStore.getCategories();

      const stats = {
        totalProducts: products.length,
        availableProducts: products.filter(p => p.inStock).length,
        myProducts: myProducts.length,
        myAvailableProducts: myProducts.filter(p => p.inStock).length,
        categoriesCount: categories.length,
        categories,
        topCategories: categories.map(cat => ({
          category: cat,
          count: productStore.findByCategory(cat).length
        })).sort((a, b) => b.count - a.count)
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

  // GET /api/products/my (Authenticated users - get their own products)
  async getMyProducts(req, res) {
    try {
      const myProducts = productStore.findByCreator(req.user.id);
      
      res.status(200).json({
        success: true,
        count: myProducts.length,
        data: myProducts
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving your products',
        error: error.message
      });
    }
  }

  // GET /api/products/categories (Public)
  async getCategories(req, res) {
    try {
      const categories = productStore.getCategories();
      
      res.status(200).json({
        success: true,
        count: categories.length,
        data: categories
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving categories',
        error: error.message
      });
    }
  }

  // GET /api/products/category/:category (Public)
  async getProductsByCategory(req, res) {
    try {
      const { category } = req.params;
      const products = productStore.findByCategory(category);
      
      res.status(200).json({
        success: true,
        category,
        count: products.length,
        data: products
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving products by category',
        error: error.message
      });
    }
  }
}

module.exports = new ProductController();
