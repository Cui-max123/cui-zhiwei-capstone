// Shared Vercel serverless handler. Vercel invokes a Node function as
// `fn(req, res)`; an Express app is such a function, so `app(req, res)` does
// all routing, body parsing and error handling exactly as under `app.listen`.
//
// The one thing Express cannot do here is hold a process open, so the Mongo
// connection is established (and reused across warm invocations) on entry.
const app = require('../src/app');
const { connectDB } = require('../src/config/db');

let inFlight = null;

function ensureConnected() {
  if (global.__czDbReady) return Promise.resolve();
  if (inFlight) return inFlight;
  inFlight = connectDB()
    .then(() => {
      global.__czDbReady = true;
    })
    .catch((error) => {
      inFlight = null;
      global.__czDbReady = false;
      throw error;
    });
  return inFlight;
}

module.exports = async function handler(req, res) {
  try {
    await ensureConnected();
  } catch (error) {
    console.error('[api] database unavailable:', error.message);
    res.statusCode = 503;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify({ success: false, message: 'Database unavailable.' }));
    return;
  }
  return app(req, res);
};
