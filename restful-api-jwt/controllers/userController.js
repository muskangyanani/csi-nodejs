const userStore = require('../data/userStore');
const User = require('../models/User');

class UserController {
  // GET /api/users (Admin only)
  async getAllUsers(req, res) {
    try {
      const users = userStore.findAll();
      res.status(200).json({
        success: true,
        count: users.length,
        data: users.map(user => user.toPublicJSON())
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving users',
        error: error.message
      });
    }
  }

  // GET /api/users/:id (Admin or owner)
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

      // Admin can see full profile, user can see their own full profile
      const responseData = req.user.role === 'admin' || req.user.id === id 
        ? user.toJSON() 
        : user.toPublicJSON();

      res.status(200).json({
        success: true,
        data: responseData
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving user',
        error: error.message
      });
    }
  }

  // POST /api/users (Admin only)
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

      const newUser = await userStore.create(userData);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: newUser.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error creating user',
        error: error.message
      });
    }
  }

  // PUT /api/users/:id (Admin or owner)
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

      // Only admin can change role
      if (userData.role && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only admin can change user role'
        });
      }

      // Only admin can activate/deactivate users
      if (userData.isActive !== undefined && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Only admin can activate/deactivate users'
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

      const updatedUser = await userStore.update(id, userData);

      res.status(200).json({
        success: true,
        message: 'User updated successfully',
        data: updatedUser.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating user',
        error: error.message
      });
    }
  }

  // DELETE /api/users/:id (Admin only)
  async deleteUser(req, res) {
    try {
      const { id } = req.params;
      
      // Prevent admin from deleting themselves
      if (req.user.id === id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete your own account'
        });
      }

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
        data: deletedUser.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deleting user',
        error: error.message
      });
    }
  }

  // GET /api/users/stats (Admin only)
  async getUserStats(req, res) {
    try {
      const users = userStore.findAll();
      const stats = {
        totalUsers: users.length,
        activeUsers: userStore.activeCount(),
        adminUsers: userStore.findByRole('admin').length,
        regularUsers: userStore.findByRole('user').length,
        averageAge: users.reduce((sum, user) => sum + user.age, 0) / users.length,
        cities: [...new Set(users.map(user => user.city))].length,
        usersByCity: users.reduce((acc, user) => {
          acc[user.city] = (acc[user.city] || 0) + 1;
          return acc;
        }, {}),
        recentLogins: users.filter(user => user.lastLogin).length
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

  // POST /api/users/:id/deactivate (Admin only)
  async deactivateUser(req, res) {
    try {
      const { id } = req.params;
      
      // Prevent admin from deactivating themselves
      if (req.user.id === id) {
        return res.status(400).json({
          success: false,
          message: 'Cannot deactivate your own account'
        });
      }

      const user = userStore.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const updatedUser = await userStore.update(id, { isActive: false });
      
      // Clear all refresh tokens for deactivated user
      userStore.clearRefreshTokens(id);

      res.status(200).json({
        success: true,
        message: 'User deactivated successfully',
        data: updatedUser.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error deactivating user',
        error: error.message
      });
    }
  }

  // POST /api/users/:id/activate (Admin only)
  async activateUser(req, res) {
    try {
      const { id } = req.params;
      
      const user = userStore.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      const updatedUser = await userStore.update(id, { isActive: true });

      res.status(200).json({
        success: true,
        message: 'User activated successfully',
        data: updatedUser.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error activating user',
        error: error.message
      });
    }
  }
}

module.exports = new UserController();
