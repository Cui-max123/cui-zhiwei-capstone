const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');

async function run() {
  const email = process.argv[2];
  if (!email) {
    console.error('Usage: npm run make:admin -- you@example.com');
    process.exitCode = 1;
    return;
  }
  try {
    await connectDB();
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.error(`No account found for ${email}. Register first, then promote.`);
      process.exitCode = 1;
      return;
    }
    if (user.role === 'admin') {
      console.log(`${user.email} is already an admin.`);
      return;
    }
    user.role = 'admin';
    await user.save();
    console.log(`Promoted ${user.email} (${user.username}) to admin.`);
  } catch (error) {
    console.error('Promotion failed:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}

run();
