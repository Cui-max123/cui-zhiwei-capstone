const ApiError = require('../utils/ApiError');

module.exports = function notFound(req, _res, next) {
  next(new ApiError(404, `Route ${req.method} ${req.originalUrl} was not found.`));
};
