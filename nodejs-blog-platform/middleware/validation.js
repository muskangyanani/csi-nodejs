const { body } = require('express-validator');

// User registration validation
const validateRegister = [
    body('username')
        .trim()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be between 3 and 30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    
    body('password')
        .isLength({ min: 6 })
        .withMessage('Password must be at least 6 characters long')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number'),
    
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('First name can only contain letters and spaces'),
    
    body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Last name can only contain letters and spaces')
];

// User login validation
const validateLogin = [
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    
    body('password')
        .notEmpty()
        .withMessage('Password is required')
];

// Blog post validation
const validateBlogPost = [
    body('title')
        .trim()
        .isLength({ min: 5, max: 200 })
        .withMessage('Title must be between 5 and 200 characters'),
    
    body('content')
        .trim()
        .isLength({ min: 50 })
        .withMessage('Content must be at least 50 characters long'),
    
    body('excerpt')
        .optional()
        .trim()
        .isLength({ max: 300 })
        .withMessage('Excerpt must be no more than 300 characters'),
    
    body('categories')
        .optional()
        .trim(),
    
    body('tags')
        .optional()
        .trim(),
    
    body('status')
        .optional()
        .isIn(['draft', 'published', 'archived'])
        .withMessage('Status must be draft, published, or archived')
];

// Profile update validation
const validateProfileUpdate = [
    body('firstName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('First name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('First name can only contain letters and spaces'),
    
    body('lastName')
        .trim()
        .isLength({ min: 2, max: 50 })
        .withMessage('Last name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Last name can only contain letters and spaces'),
    
    body('email')
        .isEmail()
        .normalizeEmail()
        .withMessage('Please provide a valid email address'),
    
    body('bio')
        .optional()
        .trim()
        .isLength({ max: 500 })
        .withMessage('Bio must be no more than 500 characters')
];

// Comment validation
const validateComment = [
    body('content')
        .trim()
        .isLength({ min: 1, max: 1000 })
        .withMessage('Comment must be between 1 and 1000 characters')
];

module.exports = {
    validateRegister,
    validateLogin,
    validateBlogPost,
    validateProfileUpdate,
    validateComment
};
