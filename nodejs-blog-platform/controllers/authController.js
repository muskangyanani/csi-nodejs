const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');

// Generate JWT token
const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// Register new user
const register = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(400).json({ errors: errors.array() });
            }
            return res.render('auth/register', { 
                errors: errors.array(), 
                formData: req.body 
            });
        }

        const { username, email, password, firstName, lastName } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ 
            $or: [{ email }, { username }] 
        });

        if (existingUser) {
            const error = existingUser.email === email ? 
                'User with this email already exists' : 
                'Username already taken';
            
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(400).json({ message: error });
            }
            return res.render('auth/register', { 
                errors: [{ msg: error }], 
                formData: req.body 
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password,
            firstName,
            lastName
        });

        await user.save();

        // Create session
        req.session.userId = user._id;
        req.session.username = user.username;

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            const token = generateToken(user._id);
            return res.status(201).json({
                message: 'User registered successfully',
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName
                }
            });
        }

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Registration error:', error);
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ message: 'Server error during registration' });
        }
        res.render('auth/register', { 
            errors: [{ msg: 'Server error during registration' }], 
            formData: req.body 
        });
    }
};

// Login user
const login = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(400).json({ errors: errors.array() });
            }
            return res.render('auth/login', { 
                errors: errors.array(), 
                formData: req.body 
            });
        }

        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            const error = 'Invalid credentials';
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(400).json({ message: error });
            }
            return res.render('auth/login', { 
                errors: [{ msg: error }], 
                formData: req.body 
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            const error = 'Invalid credentials';
            if (req.xhr || req.headers.accept.indexOf('json') > -1) {
                return res.status(400).json({ message: error });
            }
            return res.render('auth/login', { 
                errors: [{ msg: error }], 
                formData: req.body 
            });
        }

        // Create session
        req.session.userId = user._id;
        req.session.username = user.username;

        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            const token = generateToken(user._id);
            return res.json({
                message: 'Login successful',
                token,
                user: {
                    id: user._id,
                    username: user.username,
                    email: user.email,
                    firstName: user.firstName,
                    lastName: user.lastName
                }
            });
        }

        res.redirect('/dashboard');
    } catch (error) {
        console.error('Login error:', error);
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(500).json({ message: 'Server error during login' });
        }
        res.render('auth/login', { 
            errors: [{ msg: 'Server error during login' }], 
            formData: req.body 
        });
    }
};

// Logout user
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error('Logout error:', err);
        }
        res.redirect('/');
    });
};

// Show register form
const showRegisterForm = (req, res) => {
    res.render('auth/register', { errors: [], formData: {} });
};

// Show login form
const showLoginForm = (req, res) => {
    res.render('auth/login', { errors: [], formData: {} });
};

module.exports = {
    register,
    login,
    logout,
    showRegisterForm,
    showLoginForm
};
