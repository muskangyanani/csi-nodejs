const userStore = require('../data/userStore');
const User = require('../models/User');

class UserController {
  // GET /api/users
  async getAllUsers(req, res) {
    try {
      const users = userStore.findAll();
      res.status(200).json({
        success: true,
        count: users.length,
        data: users
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving users',
        error: error.message
      });
    }
  }

  // GET /api/users/:id
  async getUserById(req, res) {
    try {
      const { id } = req.params;
      const user = userStore.findById(id);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving user',
        error: error.message
      });
    }
  }

  // POST /api/users
  async createUser(req, res) {
    try {
      const userData = req.body;
      
      // Create user instance for validation
      const user = new User(userData);
      const validationErrors = user.validate();

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      // Check if email already exists
      if (userStore.emailExists(user.email)) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }

      const newUser = userStore.create(userData);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: newUser
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating user',
        error: error.message
      });
    }
  }

  // PUT /api/users/:id
  async updateUser(req, res) {
    try {
      const { id } = req.params;
      const userData = req.body;

      const existingUser = userStore.findById(id);
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Create temporary user for validation
      const tempUser = new User({ ...existingUser, ...userData });
      const validationErrors = tempUser.validate();

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      // Check if email already exists (excluding current user)
      if (userData.email && userStore.emailExists(userData.email, id)) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }

      const updatedUser = userStore.update(id, userData);

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating user',
        error: error.message
      });
    }
  }

  // DELETE /api/users/:id
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      const deletedUser = userStore.delete(id);

      if (!deletedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'User deleted successfully',
        data: deletedUser
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting user',
        error: error.message
      });
    }
  }

  // GET /api/users/stats
  async getUserStats(req, res) {
    try {
      const users = userStore.findAll();
      const stats = {
        totalUsers: users.length,
        averageAge: users.reduce((sum, user) => sum + user.age, 0) / users.length,
        cities: [...new Set(users.map(user => user.city))].length,
        usersByCity: users.reduce((acc, user) => {
          acc[user.city] = (acc[user.city] || 0) + 1;
          return acc;
        }, {})
      };

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving user statistics',
        error: error.message
      });
    }
  }
}

module.exports = new UserController();
