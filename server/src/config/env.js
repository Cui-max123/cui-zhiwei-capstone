const path = require('path');
const dotenv = require('dotenv');

// Load server/.env regardless of the directory npm was started from.
dotenv.config({ path: path.resolve(__dirname, '../../.env'), quiet: true });

function required(name, fallback = '') {
  const value = (process.env[name] || fallback).trim();
  if (!value) throw new Error(`${name} is required. Copy .env.example to .env and fill it in.`);
  return value;
}

function parseBoolean(value, fallback = false) {
  if (value === undefined || value === '') return fallback;
  return ['1', 'true', 'yes', 'on'].includes(String(value).toLowerCase());
}

const nodeEnv = process.env.NODE_ENV || 'development';
const mongoUri = (process.env.MONGO_URI || process.env.MONGODB_URI || '').trim();
if (!mongoUri) {
  throw new Error('MONGO_URI is required. Copy .env.example to .env and add your MongoDB Atlas URI.');
}

const jwtSecret = required('JWT_SECRET');
if (jwtSecret.length < 32) {
  throw new Error('JWT_SECRET must contain at least 32 characters. Use a 64-character random hex string.');
}

const rawOrigins = (process.env.CLIENT_ORIGINS || process.env.CLIENT_ORIGIN || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

let clientOrigins = rawOrigins;
if (clientOrigins.length === 0) {
  if (nodeEnv === 'production') {
    throw new Error('CLIENT_ORIGINS is required in production (comma-separated exact browser origins).');
  }
  clientOrigins = ['http://localhost:5173', 'http://127.0.0.1:5173'];
}

for (const origin of clientOrigins) {
  let parsed;
  try {
    parsed = new URL(origin);
  } catch {
    throw new Error(`CLIENT_ORIGINS contains an invalid origin: ${origin}`);
  }
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.origin !== origin) {
    throw new Error(`CLIENT_ORIGINS entries must be bare origins: ${origin}`);
  }
}

const trustProxyValue = process.env.TRUST_PROXY ?? '0';
if (!['0', '1', 'true', 'false'].includes(String(trustProxyValue).toLowerCase())) {
  throw new Error('TRUST_PROXY must be 0 or 1.');
}

module.exports = {
  nodeEnv,
  isProduction: nodeEnv === 'production',
  isTest: nodeEnv === 'test',
  port: Number(process.env.PORT || 5000),
  mongoUri,
  jwtSecret,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  jwtIssuer: 'cui-portfolio-api',
  jwtAudience: 'cui-portfolio-client',
  clientOrigins,
  trustProxy: ['1', 'true'].includes(String(trustProxyValue).toLowerCase()),
  rateLimitDisabled: parseBoolean(process.env.RATE_LIMIT_DISABLED, nodeEnv === 'test'),
  bcryptRounds: Number(process.env.BCRYPT_ROUNDS || (nodeEnv === 'test' ? 4 : 12)),
  adminEmails: (process.env.ADMIN_EMAILS || '')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
};
