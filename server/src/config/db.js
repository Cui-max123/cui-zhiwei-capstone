const mongoose = require('mongoose');
const env = require('./env');

// Serverless platforms freeze and reuse a process. Cache one connection promise
// so concurrent invocations do not open a new pool every time.
let connectionPromise = null;

async function connectDB(uri = env.mongoUri) {
  if (mongoose.connection.readyState === 1) return mongoose.connection;

  if (!connectionPromise) {
    mongoose.set('strictQuery', true);
    connectionPromise = mongoose
      .connect(uri, {
        serverSelectionTimeoutMS: 12000,
        maxPoolSize: env.isProduction ? 10 : 5,
        autoIndex: !env.isProduction
      })
      .then((instance) => {
        if (!env.isTest) {
          console.log(`MongoDB connected: ${instance.connection.host}/${instance.connection.name}`);
        }
        return instance.connection;
      })
      .catch((error) => {
        connectionPromise = null;
        throw error;
      });
  }

  return connectionPromise;
}

async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  connectionPromise = null;
}

function dbStatus() {
  const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  return states[mongoose.connection.readyState] || 'unknown';
}

module.exports = { connectDB, disconnectDB, dbStatus };
