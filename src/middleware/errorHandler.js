/**
 * Global error handler middleware.
 * Catches all unhandled errors and returns a structured JSON response.
 */
const errorHandler = (err, _req, res, _next) => {
  console.error('[ERROR]', err.message, err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.statusCode ? err.message : 'Internal server error';

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

/**
 * Helper to create an error with a status code.
 */
class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
  }
}

module.exports = { errorHandler, AppError };
