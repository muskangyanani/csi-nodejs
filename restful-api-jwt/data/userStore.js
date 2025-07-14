const User = require('../models/User');
const passwordUtils = require('../utils/password');

class UserStore {
  constructor() {
    this.users = new Map();
    this.initializeData();
  }

  // Initialize with sample data
  async initializeData() {
    const sampleUsers = [
      {
        name: 'Admin User',
        email: 'admin@example.com',
        password: 'Admin123!',
        age: 30,
        city: 'New York',
        role: 'admin'
      },
      {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'User123!',
        age: 25,
        city: 'Los Angeles',
        role: 'user'
      },
      {
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'User123!',
        age: 28,
        city: 'Chicago',
        role: 'user'
      }
    ];

    for (const userData of sampleUsers) {
      const user = new User(userData);
      await user.hashPassword();
      this.users.set(user.id, user);
    }
  }

  // Get all users
  findAll() {
    return Array.from(this.users.values());
  }

  // Get user by ID
  findById(id) {
    return this.users.get(id);
  }

  // Get user by email
  findByEmail(email) {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  // Create new user
  async create(userData) {
    const user = new User(userData);
    await user.hashPassword();
    this.users.set(user.id, user);
    return user;
  }

  // Update user
  async update(id, userData) {
    const user = this.users.get(id);
    if (!user) {
      return null;
    }

    // If password is being updated, hash it
    if (userData.password) {
      userData.password = await passwordUtils.hashPassword(userData.password);
    }

    user.update(userData);
    return user;
  }

  // Delete user
  delete(id) {
    const user = this.users.get(id);
    if (!user) {
      return null;
    }
    this.users.delete(id);
    return user;
  }

  // Check if email exists (for validation)
  emailExists(email, excludeId = null) {
    return Array.from(this.users.values()).some(user => 
      user.email === email && user.id !== excludeId
    );
  }

  // Authenticate user
  async authenticate(email, password) {
    const user = this.findByEmail(email);
    if (!user) {
      return null;
    }

    const isPasswordValid = await user.verifyPassword(password);
    if (!isPasswordValid) {
      return null;
    }

    if (!user.isActive) {
      return null;
    }

    return user;
  }

  // Update user's last login
  updateLastLogin(userId) {
    const user = this.users.get(userId);
    if (user) {
      user.updateLastLogin();
    }
  }

  // Add refresh token to user
  addRefreshToken(userId, token) {
    const user = this.users.get(userId);
    if (user) {
      user.addRefreshToken(token);
    }
  }

  // Remove refresh token from user
  removeRefreshToken(userId, token) {
    const user = this.users.get(userId);
    if (user) {
      user.removeRefreshToken(token);
    }
  }

  // Check if refresh token exists for user
  hasRefreshToken(userId, token) {
    const user = this.users.get(userId);
    return user ? user.refreshTokens.includes(token) : false;
  }

  // Clear all refresh tokens for user
  clearRefreshTokens(userId) {
    const user = this.users.get(userId);
    if (user) {
      user.clearRefreshTokens();
    }
  }

  // Get users count
  count() {
    return this.users.size;
  }

  // Get active users count
  activeCount() {
    return Array.from(this.users.values()).filter(user => user.isActive).length;
  }

  // Get users by role
  findByRole(role) {
    return Array.from(this.users.values()).filter(user => user.role === role);
  }
}

module.exports = new UserStore();
