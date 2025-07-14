const userStore = require('../data/userStore');
const User = require('../models/User');
const jwtUtils = require('../utils/jwt');
const passwordUtils = require('../utils/password');

class AuthController {
  // POST /api/auth/register
  async register(req, res) {
    try {
      const userData = req.body;

      // Validate user data
      const user = new User(userData);
      const validationErrors = user.validate();

      if (validationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: validationErrors
        });
      }

      // Validate password strength
      const passwordErrors = passwordUtils.validatePasswordStrength(userData.password);
      if (passwordErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Password validation failed',
          errors: passwordErrors
        });
      }

      // Check if email already exists
      if (userStore.emailExists(userData.email)) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }

      // Create user
      const newUser = await userStore.create(userData);
      
      // Generate tokens
      const tokens = jwtUtils.generateTokens(newUser);
      
      // Store refresh token
      userStore.addRefreshToken(newUser.id, tokens.refreshToken);
      
      // Update last login
      userStore.updateLastLogin(newUser.id);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: newUser.toJSON(),
          tokens
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error registering user',
        error: error.message
      });
    }
  }

  // POST /api/auth/login
  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Authenticate user
      const user = await userStore.authenticate(email, password);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate tokens
      const tokens = jwtUtils.generateTokens(user);
      
      // Store refresh token
      userStore.addRefreshToken(user.id, tokens.refreshToken);
      
      // Update last login
      userStore.updateLastLogin(user.id);

      res.status(200).json({
        success: true,
        message: 'Login successful',
        data: {
          user: user.toJSON(),
          tokens
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error during login',
        error: error.message
      });
    }
  }

  // POST /api/auth/refresh
  async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: 'Refresh token is required'
        });
      }

      // Verify refresh token
      const decoded = jwtUtils.verifyToken(refreshToken);
      
      // Check if user exists
      const user = userStore.findById(decoded.userId);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check if refresh token is valid for this user
      if (!userStore.hasRefreshToken(user.id, refreshToken)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      // Generate new tokens
      const tokens = jwtUtils.generateTokens(user);
      
      // Remove old refresh token and add new one
      userStore.removeRefreshToken(user.id, refreshToken);
      userStore.addRefreshToken(user.id, tokens.refreshToken);

      res.status(200).json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          tokens
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
        error: error.message
      });
    }
  }

  // POST /api/auth/logout
  async logout(req, res) {
    try {
      const { refreshToken } = req.body;
      const userId = req.user.id;

      if (refreshToken) {
        // Remove specific refresh token
        userStore.removeRefreshToken(userId, refreshToken);
      } else {
        // Remove all refresh tokens for this user
        userStore.clearRefreshTokens(userId);
      }

      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error during logout',
        error: error.message
      });
    }
  }

  // GET /api/auth/profile
  async getProfile(req, res) {
    try {
      const user = req.user;
      res.status(200).json({
        success: true,
        data: user.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error retrieving profile',
        error: error.message
      });
    }
  }

  // PUT /api/auth/profile
  async updateProfile(req, res) {
    try {
      const userId = req.user.id;
      const updateData = req.body;

      // Don't allow password update through profile endpoint
      if (updateData.password) {
        return res.status(400).json({
          success: false,
          message: 'Use change password endpoint to update password'
        });
      }

      // Don't allow role update through profile endpoint
      if (updateData.role) {
        return res.status(400).json({
          success: false,
          message: 'Role cannot be changed through profile update'
        });
      }

      // Check if new email already exists
      if (updateData.email && userStore.emailExists(updateData.email, userId)) {
        return res.status(409).json({
          success: false,
          message: 'Email already exists'
        });
      }

      const updatedUser = await userStore.update(userId, updateData);
      
      if (!updatedUser) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser.toJSON()
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error updating profile',
        error: error.message
      });
    }
  }

  // POST /api/auth/change-password
  async changePassword(req, res) {
    try {
      const userId = req.user.id;
      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          success: false,
          message: 'Current password and new password are required'
        });
      }

      // Validate new password strength
      const passwordErrors = passwordUtils.validatePasswordStrength(newPassword);
      if (passwordErrors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Password validation failed',
          errors: passwordErrors
        });
      }

      // Verify current password
      const user = userStore.findById(userId);
      const isCurrentPasswordValid = await user.verifyPassword(currentPassword);
      
      if (!isCurrentPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Update password
      await userStore.update(userId, { password: newPassword });

      // Clear all refresh tokens to force re-login
      userStore.clearRefreshTokens(userId);

      res.status(200).json({
        success: true,
        message: 'Password changed successfully. Please login again.'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Error changing password',
        error: error.message
      });
    }
  }
}

module.exports = new AuthController();
