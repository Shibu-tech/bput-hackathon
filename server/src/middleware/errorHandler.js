const ApiError = require('../utils/ApiError');

/**
 * Error handling middleware
 */
const errorHandler = (err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // Default error values
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // If it's not an operational error, don't leak details
  if (!err.isOperational) {
    statusCode = 500;
    message = 'Internal Server Error';
  }

  // Log error for debugging (in production, use proper logging)
  console.error(`[${new Date().toISOString()}] Error:`, err);

  res.status(statusCode).json({
    success: false,
    message: message,
    // Only include stack trace in development
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

module.exports = errorHandler;