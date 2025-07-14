const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// Import routes
const userRoutes = require('./routes/users');
const productRoutes = require('./routes/products');

// Import middleware
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors());

// Logging middleware
app.use(morgan('combined'));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/products', productRoutes);

// Root route with API documentation
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to RESTful API',
    version: '1.0.0',
    endpoints: {
      users: {
        'GET /api/users': 'Get all users',
        'GET /api/users/:id': 'Get user by ID',
        'POST /api/users': 'Create new user',
        'PUT /api/users/:id': 'Update user by ID',
        'DELETE /api/users/:id': 'Delete user by ID'
      },
      products: {
        'GET /api/products': 'Get all products',
        'GET /api/products/:id': 'Get product by ID',
        'POST /api/products': 'Create new product',
        'PUT /api/products/:id': 'Update product by ID',
        'DELETE /api/products/:id': 'Delete product by ID'
      }
    },
    documentation: {
      postman: 'Import the API collection from /api/docs/postman',
      swagger: 'API documentation available at /api/docs'
    }
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
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
});

module.exports = app;
