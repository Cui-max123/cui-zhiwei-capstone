const env = require('./config/env');
const { connectDB, disconnectDB } = require('./config/db');

async function start() {
  await connectDB();
  const app = require('./app');
  const server = app.listen(env.port, '0.0.0.0', () => {
    console.log(`API ready at http://localhost:${env.port}/api`);
    console.log(`Allowed browser origin(s): ${env.clientOrigins.join(', ')}`);
  });

  const shutdown = async (signal) => {
    console.log(`\n${signal} received. Closing server...`);
    server.close(async () => {
      await disconnectDB();
      process.exit(0);
    });
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

start().catch(async (error) => {
  console.error('Could not start the API.');
  console.error(error.message);
  await disconnectDB();
  process.exitCode = 1;
});
