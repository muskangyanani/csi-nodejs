const errorHandler = (err, req, res, next) => {
  console.error('Error:', err.stack);

  // Default error response
  let error = {
    success: false,
    message: 'Internal Server Error',
    statusCode: 500
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.message = 'Validation Error';
    error.statusCode = 400;
    error.errors = Object.values(err.errors).map(e => e.message);
  }

  if (err.name === 'CastError') {
    error.message = 'Invalid ID format';
    error.statusCode = 400;
  }

  if (err.code === 11000) {
    error.message = 'Duplicate field value';
    error.statusCode = 409;
  }

  if (err.name === 'JsonWebTokenError') {
    error.message = 'Invalid token';
    error.statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    error.message = 'Token expired';
    error.statusCode = 401;
  }

  // Custom error handling
  if (err.statusCode) {
    error.statusCode = err.statusCode;
    error.message = err.message;
  }

  // Send error response
  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    ...(error.errors && { errors: error.errors }),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

module.exports = errorHandler;
