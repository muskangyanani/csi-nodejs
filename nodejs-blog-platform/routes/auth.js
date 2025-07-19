const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middleware/validation');

// Show register form
router.get('/register', authController.showRegisterForm);

// Handle registration
router.post('/register', validateRegister, authController.register);

// Show login form
router.get('/login', authController.showLoginForm);

// Handle login
router.post('/login', validateLogin, authController.login);

// Handle logout
router.post('/logout', authController.logout);
router.get('/logout', authController.logout);

module.exports = router;
