const crypto = require('crypto');

module.exports = function requestId(req, res, next) {
  req.id = req.get('x-request-id') || crypto.randomUUID();
  res.set('X-Request-Id', req.id);
  next();
};
