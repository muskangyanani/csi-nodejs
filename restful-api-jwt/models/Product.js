const { v4: uuidv4 } = require('uuid');

class Product {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.description = data.description;
    this.price = data.price;
    this.category = data.category;
    this.inStock = data.inStock !== undefined ? data.inStock : true;
    this.createdBy = data.createdBy; // User ID who created the product
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Validation method
  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Product name is required');
    }

    if (!this.description || this.description.trim().length === 0) {
      errors.push('Product description is required');
    }

    if (!this.price || this.price <= 0) {
      errors.push('Price must be a positive number');
    }

    if (!this.category || this.category.trim().length === 0) {
      errors.push('Category is required');
    }

    if (typeof this.inStock !== 'boolean') {
      errors.push('inStock must be a boolean value');
    }

    return errors;
  }

  // Update product data
  update(data) {
    if (data.name !== undefined) this.name = data.name;
    if (data.description !== undefined) this.description = data.description;
    if (data.price !== undefined) this.price = data.price;
    if (data.category !== undefined) this.category = data.category;
    if (data.inStock !== undefined) this.inStock = data.inStock;
    this.updatedAt = new Date().toISOString();
  }

  // Convert to JSON
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      price: this.price,
      category: this.category,
      inStock: this.inStock,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = Product;
