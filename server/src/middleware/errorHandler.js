const env = require('../config/env');

function errorHandler(error, req, res, _next) {
  if (res.headersSent) return;

  let status = error.statusCode || error.status || 500;
  let message = error.message || 'Something went wrong.';
  let errors = error.errors;

  if (error.name === 'ValidationError' && error.errors) {
    status = 400;
    message = 'Validation failed';
    errors = {};
    for (const [field, detail] of Object.entries(error.errors)) {
      errors[field] = detail.message;
    }
  } else if (error.name === 'CastError') {
    status = 400;
    message = `Invalid value for ${error.path}.`;
  } else if (error.code === 11000) {
    status = 409;
    const field = Object.keys(error.keyValue || error.keyPattern || {})[0];
    message = field === 'email'
      ? 'An account with that email already exists.'
      : field === 'username'
        ? 'That username is already taken.'
        : 'That record already exists.';
    errors = field ? { [field]: message } : undefined;
  } else if (error.type === 'entity.parse.failed') {
    status = 400;
    message = 'Request body is not valid JSON.';
  } else if (error.type === 'entity.too.large') {
    status = 413;
    message = 'Request body is too large.';
  }

  if (!Number.isInteger(status) || status < 400 || status > 599) status = 500;

  if (status >= 500) {
    console.error(`[${req.id || 'no-request-id'}] ${req.method} ${req.originalUrl}`, {
      name: error.name,
      message: error.message,
      stack: env.isProduction ? undefined : error.stack
    });
    message = 'The server could not complete that request.';
    errors = undefined;
  }

  const body = { success: false, message };
  if (errors && Object.keys(errors).length) body.errors = errors;
  if (req.id) body.requestId = req.id;
  res.status(status).json(body);
}

module.exports = errorHandler;
