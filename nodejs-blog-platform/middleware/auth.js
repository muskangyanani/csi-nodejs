const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.userId) {
        return next();
    }
    
    // Check for JWT token in header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }
        return res.redirect('/auth/login');
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        if (req.xhr || req.headers.accept.indexOf('json') > -1) {
            return res.status(401).json({ message: 'Invalid token.' });
        }
        return res.redirect('/auth/login');
    }
};

// Get current user info
const getCurrentUser = async (req, res, next) => {
    try {
        if (req.session && req.session.userId) {
            const user = await User.findById(req.session.userId).select('-password');
            req.user = user;
        }
        next();
    } catch (error) {
        next();
    }
};

// Check if user is admin
const isAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Access denied. Please log in.' });
        }
        
        const user = await User.findById(req.user._id || req.user.id);
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }
        
        next();
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

// Check if user owns the resource or is admin
const isOwnerOrAdmin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Access denied. Please log in.' });
        }
        
        const user = await User.findById(req.user._id || req.user.id);
        
        // If user is admin, allow access
        if (user && user.isAdmin) {
            return next();
        }
        
        // Check if user owns the resource (assuming resource has author field)
        const resourceId = req.params.id;
        if (req.resource && req.resource.author && req.resource.author.toString() === user._id.toString()) {
            return next();
        }
        
        return res.status(403).json({ message: 'Access denied. You can only modify your own content.' });
    } catch (error) {
        return res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    isAuthenticated,
    getCurrentUser,
    isAdmin,
    isOwnerOrAdmin
};
