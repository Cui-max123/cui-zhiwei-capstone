// Wrap async route handlers so a rejected promise reaches the error middleware.
// Express 5 does this itself, but the explicit wrapper keeps the intent obvious
// and makes the controllers portable to Express 4 if needed.
module.exports = function asyncHandler(handler) {
  return function wrapped(req, res, next) {
    Promise.resolve(handler(req, res, next)).catch(next);
  };
};
