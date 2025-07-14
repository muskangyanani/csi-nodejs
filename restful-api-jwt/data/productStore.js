const Product = require('../models/Product');

class ProductStore {
  constructor() {
    this.products = new Map();
    this.initializeData();
  }

  // Initialize with sample data
  initializeData() {
    const sampleProducts = [
      new Product({
        name: 'Laptop',
        description: 'High-performance laptop for professionals',
        price: 999.99,
        category: 'Electronics',
        inStock: true,
        createdBy: 'system'
      }),
      new Product({
        name: 'Smartphone',
        description: 'Latest smartphone with advanced features',
        price: 699.99,
        category: 'Electronics',
        inStock: true,
        createdBy: 'system'
      }),
      new Product({
        name: 'Coffee Maker',
        description: 'Automatic coffee maker for home use',
        price: 149.99,
        category: 'Home & Kitchen',
        inStock: false,
        createdBy: 'system'
      }),
      new Product({
        name: 'Running Shoes',
        description: 'Comfortable running shoes for athletes',
        price: 89.99,
        category: 'Sports',
        inStock: true,
        createdBy: 'system'
      })
    ];

    sampleProducts.forEach(product => {
      this.products.set(product.id, product);
    });
  }

  // Get all products
  findAll(filters = {}) {
    let products = Array.from(this.products.values());

    // Apply filters
    if (filters.category) {
      products = products.filter(p => p.category.toLowerCase().includes(filters.category.toLowerCase()));
    }

    if (filters.inStock !== undefined) {
      products = products.filter(p => p.inStock === filters.inStock);
    }

    if (filters.minPrice) {
      products = products.filter(p => p.price >= parseFloat(filters.minPrice));
    }

    if (filters.maxPrice) {
      products = products.filter(p => p.price <= parseFloat(filters.maxPrice));
    }

    if (filters.createdBy) {
      products = products.filter(p => p.createdBy === filters.createdBy);
    }

    return products;
  }

  // Get product by ID
  findById(id) {
    return this.products.get(id);
  }

  // Create new product
  create(productData, userId) {
    const product = new Product({
      ...productData,
      createdBy: userId
    });
    this.products.set(product.id, product);
    return product;
  }

  // Update product
  update(id, productData) {
    const product = this.products.get(id);
    if (!product) {
      return null;
    }
    product.update(productData);
    return product;
  }

  // Delete product
  delete(id) {
    const product = this.products.get(id);
    if (!product) {
      return null;
    }
    this.products.delete(id);
    return product;
  }

  // Check if user can modify product (owner or admin)
  canModify(productId, userId, userRole) {
    const product = this.products.get(productId);
    if (!product) {
      return false;
    }
    
    return userRole === 'admin' || product.createdBy === userId;
  }

  // Get products count
  count() {
    return this.products.size;
  }

  // Get products by category
  findByCategory(category) {
    return Array.from(this.products.values()).filter(p => 
      p.category.toLowerCase() === category.toLowerCase()
    );
  }

  // Get products by creator
  findByCreator(userId) {
    return Array.from(this.products.values()).filter(p => p.createdBy === userId);
  }

  // Get all categories
  getCategories() {
    const categories = new Set();
    this.products.forEach(product => {
      categories.add(product.category);
    });
    return Array.from(categories);
  }
}

module.exports = new ProductStore();
