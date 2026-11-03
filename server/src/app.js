const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const env = require('./config/env');
const { dbStatus } = require('./config/db');
const requestId = require('./middleware/requestId');
const sanitize = require('./middleware/sanitize');
const notFound = require('./middleware/notFound');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimit');

const app = express();
app.disable('x-powered-by');
if (env.trustProxy) app.set('trust proxy', 1);

app.use(requestId);
app.use(helmet({ crossOriginResourcePolicy: { policy: 'cross-origin' } }));
app.use(
  cors({
    origin(origin, callback) {
      // Same-origin requests and server-to-server calls have no Origin header.
      if (!origin || env.clientOrigins.includes(origin)) return callback(null, true);
      return callback(new Error(`Origin ${origin} is not allowed by CORS.`));
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    exposedHeaders: ['X-Request-Id', 'RateLimit', 'RateLimit-Policy']
  })
);
app.use(compression());
app.use(express.json({ limit: '100kb' }));
app.use(sanitize);

const serviceInfo = {
  success: true,
  name: 'Cui Zhiwei Portfolio & Blog API',
  version: '1.0.0',
  student: { id: '24998007', name: 'Cui Zhiwei' },
  endpoints: {
    health: ['GET /api/health'],
    users: ['POST /api/users/register', 'POST /api/users/login', 'GET /api/users/me'],
    projects: [
      'GET /api/projects',
      'GET /api/projects/:id',
      'POST /api/projects',
      'PUT /api/projects/:id',
      'DELETE /api/projects/:id'
    ],
    skills: [
      'GET /api/skills',
      'GET /api/skills/:id',
      'POST /api/skills',
      'PUT /api/skills/:id',
      'DELETE /api/skills/:id'
    ],
    blog: [
      'GET /api/blog',
      'GET /api/blog/manage',
      'GET /api/blog/:id',
      'POST /api/blog',
      'PUT /api/blog/:id',
      'DELETE /api/blog/:id'
    ],
    comments: [
      'GET /api/blog/:postId/comments',
      'POST /api/blog/:postId/comments',
      'DELETE /api/blog/:postId/comments/:commentId'
    ],
    contact: [
      'POST /api/contact',
      'GET /api/contact',
      'PATCH /api/contact/:id/read',
      'DELETE /api/contact/:id'
    ],
    admin: ['GET /api/admin/stats', 'GET /api/admin/activity']
  }
};

app.get('/', (_req, res) => res.json(serviceInfo));
app.get('/api', (_req, res) => res.json(serviceInfo));
app.get('/health', (_req, res) =>
  res.json({ success: true, status: 'ok', database: dbStatus(), uptime: process.uptime(), at: new Date().toISOString() })
);
app.get('/api/health', (_req, res) =>
  res.json({ success: true, status: 'ok', database: dbStatus(), uptime: process.uptime(), at: new Date().toISOString() })
);

app.use('/api', apiLimiter);
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/projects', require('./routes/projectRoutes'));
app.use('/api/skills', require('./routes/skillRoutes'));
app.use('/api/blog', require('./routes/postRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
