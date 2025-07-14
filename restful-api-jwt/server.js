require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const { authenticateToken } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Logging middleware
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Root route with API documentation
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to RESTful API with JWT Authentication',
    version: '1.0.0',
    authentication: {
      'POST /api/auth/register': 'Register new user',
      'POST /api/auth/login': 'Login user',
      'POST /api/auth/refresh': 'Refresh access token',
      'POST /api/auth/logout': 'Logout user (requires auth)',
      'GET /api/auth/profile': 'Get user profile (requires auth)',
      'PUT /api/auth/profile': 'Update user profile (requires auth)',
      'POST /api/auth/change-password': 'Change password (requires auth)'
    },
    endpoints: {
      users: {
        'GET /api/users': 'Get all users (admin only)',
        'GET /api/users/:id': 'Get user by ID (admin or owner)',
        'POST /api/users': 'Create new user (admin only)',
        'PUT /api/users/:id': 'Update user (admin or owner)',
        'DELETE /api/users/:id': 'Delete user (admin only)',
        'GET /api/users/stats': 'Get user statistics (admin only)',
        'POST /api/users/:id/activate': 'Activate user (admin only)',
        'POST /api/users/:id/deactivate': 'Deactivate user (admin only)'
      },
      products: {
        'GET /api/products': 'Get all products (public)',
        'GET /api/products/:id': 'Get product by ID (public)',
        'POST /api/products': 'Create new product (auth required)',
        'PUT /api/products/:id': 'Update product (owner or admin)',
        'DELETE /api/products/:id': 'Delete product (owner or admin)',
        'GET /api/products/stats': 'Get product statistics (auth required)',
        'GET /api/products/my': 'Get my products (auth required)',
        'GET /api/products/categories': 'Get all categories (public)',
        'GET /api/products/category/:category': 'Get products by category (public)'
      }
    },
    sampleAccounts: {
      admin: {
        email: 'admin@example.com',
        password: 'Admin123!',
        role: 'admin'
      },
      user: {
        email: 'john@example.com',
        password: 'User123!',
        role: 'user'
      }
    },
    authentication_info: {
      token_type: 'Bearer',
      header_format: 'Authorization: Bearer <token>',
      access_token_expires: process.env.JWT_EXPIRES_IN,
      refresh_token_expires: process.env.JWT_REFRESH_EXPIRES_IN
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Protected route example
app.get('/api/protected', authenticateToken, (req, res) => {
  res.json({
    message: 'This is a protected route',
    user: req.user.toJSON(),
    tokenInfo: {
      userId: req.tokenPayload.userId,
      email: req.tokenPayload.email,
      role: req.tokenPayload.role,
      iat: req.tokenPayload.iat,
      exp: req.tokenPayload.exp
    }
  });
});

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}`);
  console.log(`🔍 Health Check: http://localhost:${PORT}/health`);
  console.log(`🔐 Protected Route: http://localhost:${PORT}/api/protected`);
  console.log(`🔑 JWT Authentication enabled`);
  console.log(`👤 Sample Admin: admin@example.com / Admin123!`);
  console.log(`👤 Sample User: john@example.com / User123!`);
});

module.exports = app;
