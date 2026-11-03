const jwt = require('jsonwebtoken');
const User = require('../models/User');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');

const protect = asyncHandler(async function protect(req, _res, next) {
  const header = req.get('authorization') || '';
  const match = /^Bearer\s+([^\s]+)$/i.exec(header);
  if (!match) throw new ApiError(401, 'Sign in to continue: a Bearer token is required.');

  let payload;
  try {
    payload = jwt.verify(match[1], env.jwtSecret, {
      algorithms: ['HS256'],
      issuer: env.jwtIssuer,
      audience: env.jwtAudience
    });
  } catch {
    throw new ApiError(401, 'Your session is invalid or has expired. Please sign in again.');
  }

  if (typeof payload.sub !== 'string') throw new ApiError(401, 'Invalid token subject.');
  const user = await User.findById(payload.sub).select('username email role createdAt');
  if (!user) throw new ApiError(401, 'This account no longer exists.');

  req.user = user;
  next();
});

module.exports = protect;
