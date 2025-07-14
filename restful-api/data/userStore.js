const User = require('../models/User');

class UserStore {
  constructor() {
    this.users = new Map();
    this.initializeData();
  }

  // Initialize with sample data
  initializeData() {
    const sampleUsers = [
      new User({
        name: 'John Doe',
        email: 'john@example.com',
        age: 30,
        city: 'New York'
      }),
      new User({
        name: 'Jane Smith',
        email: 'jane@example.com',
        age: 25,
        city: 'Los Angeles'
      }),
      new User({
        name: 'Bob Johnson',
        email: 'bob@example.com',
        age: 35,
        city: 'Chicago'
      })
    ];

    sampleUsers.forEach(user => {
      this.users.set(user.id, user);
    });
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
  create(userData) {
    const user = new User(userData);
    this.users.set(user.id, user);
    return user;
  }

  // Update user
  update(id, userData) {
    const user = this.users.get(id);
    if (!user) {
      return null;
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

  // Get users count
  count() {
    return this.users.size;
  }
}

module.exports = new UserStore();
