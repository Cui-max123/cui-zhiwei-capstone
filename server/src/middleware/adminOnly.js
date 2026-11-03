const ApiError = require('../utils/ApiError');

module.exports = function adminOnly(req, _res, next) {
  if (!req.user) return next(new ApiError(401, 'Sign in to continue.'));
  if (req.user.role !== 'admin') {
    return next(new ApiError(403, 'This action is limited to the portfolio administrator.'));
  }
  return next();
};
