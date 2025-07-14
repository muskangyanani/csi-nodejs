const { v4: uuidv4 } = require('uuid');
const passwordUtils = require('../utils/password');

class User {
  constructor(data) {
    this.id = data.id || uuidv4();
    this.name = data.name;
    this.email = data.email;
    this.password = data.password; // This will be hashed
    this.age = data.age;
    this.city = data.city;
    this.role = data.role || 'user'; // user, admin
    this.isActive = data.isActive !== undefined ? data.isActive : true;
    this.lastLogin = data.lastLogin || null;
    this.refreshTokens = data.refreshTokens || [];
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

    if (!this.isValidRole(this.role)) {
      errors.push('Invalid role. Must be user or admin');
    }

    return errors;
  }

  // Email validation helper
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Role validation helper
  isValidRole(role) {
    return ['user', 'admin'].includes(role);
  }

  // Hash password
  async hashPassword() {
    if (this.password) {
      this.password = await passwordUtils.hashPassword(this.password);
    }
  }

  // Verify password
  async verifyPassword(password) {
    return await passwordUtils.verifyPassword(password, this.password);
  }

  // Update user data
  update(data) {
    if (data.name !== undefined) this.name = data.name;
    if (data.email !== undefined) this.email = data.email;
    if (data.age !== undefined) this.age = data.age;
    if (data.city !== undefined) this.city = data.city;
    if (data.role !== undefined) this.role = data.role;
    if (data.isActive !== undefined) this.isActive = data.isActive;
    this.updatedAt = new Date().toISOString();
  }

  // Update last login
  updateLastLogin() {
    this.lastLogin = new Date().toISOString();
  }

  // Add refresh token
  addRefreshToken(token) {
    this.refreshTokens.push(token);
  }

  // Remove refresh token
  removeRefreshToken(token) {
    this.refreshTokens = this.refreshTokens.filter(t => t !== token);
  }

  // Clear all refresh tokens
  clearRefreshTokens() {
    this.refreshTokens = [];
  }

  // Convert to JSON (excluding sensitive data)
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      age: this.age,
      city: this.city,
      role: this.role,
      isActive: this.isActive,
      lastLogin: this.lastLogin,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  // Convert to JSON for public display (even less sensitive data)
  toPublicJSON() {
    return {
      id: this.id,
      name: this.name,
      email: this.email,
      age: this.age,
      city: this.city,
      role: this.role,
      createdAt: this.createdAt
    };
  }
}

module.exports = User;
