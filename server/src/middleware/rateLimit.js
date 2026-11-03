const { rateLimit } = require('express-rate-limit');
const env = require('../config/env');

const reply = (message) => (req, res) => {
  res.status(429).json({ success: false, message });
};

function limiter({ windowMs, limit, message }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    skip: () => env.rateLimitDisabled,
    handler: reply(message)
  });
}

const apiLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  limit: 400,
  message: 'Too many requests from this address. Please wait a few minutes.'
});

const authLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  limit: 12,
  message: 'Too many sign-in attempts. Try again in 15 minutes.'
});

const contactLimiter = limiter({
  windowMs: 60 * 60 * 1000,
  limit: 6,
  message: 'Too many messages from this address. Try again later.'
});

const writeLimiter = limiter({
  windowMs: 15 * 60 * 1000,
  limit: 80,
  message: 'Too many changes in a short time. Please slow down.'
});

module.exports = { apiLimiter, authLimiter, contactLimiter, writeLimiter };
