const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { isAuthenticated } = require('../middleware/auth');
const { validateProfileUpdate } = require('../middleware/validation');

// Apply authentication middleware to all dashboard routes
router.use(isAuthenticated);

// Dashboard home
router.get('/', dashboardController.showDashboard);

// My posts
router.get('/posts', dashboardController.showMyPosts);

// Profile
router.get('/profile', dashboardController.showProfile);
router.post('/profile', validateProfileUpdate, dashboardController.updateProfile);

module.exports = router;
