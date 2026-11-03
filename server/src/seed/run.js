const { connectDB, disconnectDB } = require('../config/db');
const { seedDatabase } = require('./index');

async function run() {
  const reset = process.argv.includes('--reset');
  try {
    await connectDB();
    await seedDatabase({ reset });
  } catch (error) {
    console.error('Seeding failed:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

run();
