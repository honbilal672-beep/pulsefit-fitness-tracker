import { logger } from '../config/logger.js';
class AppError extends Error {
  statusCode;
  errors;
  constructor(message, statusCode = 500, errors) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    Error.captureStackTrace(this, this.constructor);
  }
}
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    message: `API Route not found: ${req.method} ${req.originalUrl}`
  });
};
const errorHandler = (err, req, res, _next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || "Internal Server Error";
  let errors = err.errors;
  if (err.name === "CastError") {
    statusCode = 400;
    message = `Invalid resource identifier format: ${err.value}`;
  }
  if (err.code === 11e3) {
    statusCode = 409;
    const duplicatedField = Object.keys(err.keyValue || {})[0] || "field";
    const value = err.keyValue ? err.keyValue[duplicatedField] : "";
    message = `A record with ${duplicatedField} '${value}' already exists.`;
  }
  if (err.name === "ValidationError") {
    statusCode = 400;
    message = "Validation failed";
    errors = Object.values(err.errors || {}).map((e) => ({
      field: e.path,
      message: e.message
    }));
  }
  if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid authentication token";
  }
  if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Authentication token has expired";
  }
  if (statusCode >= 500) {
    logger.error(`[${req.method}] ${req.originalUrl} - ${message}`, {
      stack: err.stack,
      body: req.body,
      query: req.query,
      params: req.params
    });
  } else {
    logger.warn(`[${req.method}] ${req.originalUrl} - ${statusCode} - ${message}`);
  }
  res.status(statusCode).json({
    success: false,
    message,
    ...errors && { errors },
    ...process.env.NODE_ENV === "development" && { stack: err.stack }
  });
};
export {
  AppError,
  errorHandler,
  notFoundHandler
};
