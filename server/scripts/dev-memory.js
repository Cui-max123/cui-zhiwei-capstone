// Run the API against an in-memory MongoDB so the whole stack works without an
// Atlas account. Seeds sample data on first start. Not for production.
const { MongoMemoryServer } = require('mongodb-memory-server');

async function start() {
  const mongod = await MongoMemoryServer.create();
  process.env.MONGO_URI = mongod.getUri('cui_portfolio');
  process.env.JWT_SECRET = 'dev-memory-secret-0123456789abcdef0123456789abcdef';
  process.env.NODE_ENV = 'development';
  process.env.RATE_LIMIT_DISABLED = 'true';

  const { connectDB } = require('../src/config/db');
  const { seedDatabase } = require('../src/seed');
  const { port } = require('../src/config/env');

  await connectDB();
  await seedDatabase({ quiet: true });

  const app = require('../src/app');
  const server = app.listen(port, () => {
    console.log(`In-memory API ready at http://localhost:${port}/api`);
    console.log('Admin account: cui@cuizhiwei.dev / CuiZhiwei2026!');
  });

  const shutdown = async () => {
    server.close(async () => {
      await mongod.stop();
      process.exit(0);
    });
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

start().catch((error) => {
  console.error('Failed to start in-memory API:', error.message);
  process.exitCode = 1;
});
