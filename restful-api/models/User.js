const { v4: uuidv4 } = require('uuid');

class User {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.email = data.email;
    this.age = data.age;
    this.city = data.city;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
  }

  // Validation method
  validate() {
    const errors = [];

    if (!this.name || this.name.trim().length === 0) {
      errors.push('Name is required');
    }

    if (!this.email || this.email.trim().length === 0) {
      errors.push('Email is required');
    } else if (!this.isValidEmail(this.email)) {
      errors.push('Invalid email format');
    }

    if (!this.age || this.age < 0) {
      errors.push('Age must be a positive number');
    }

    if (!this.city || this.city.trim().length === 0) {
      errors.push('City is required');
    }

    return errors;
  }

  // Email validation helper
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Update user data
  update(data) {
    if (data.name !== undefined) this.name = data.name;
    if (data.email !== undefined) this.email = data.email;
    if (data.age !== undefined) this.age = data.age;
    if (data.city !== undefined) this.city = data.city;
    this.updatedAt = new Date().toISOString();
  }

  // Convert to JSON (removing sensitive data if needed)
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      age: this.age,
      city: this.city,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }
}

module.exports = User;
