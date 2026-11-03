// Catch-all for every `/api/*` route. Vercel exposes the captured segments in
// `req.query.path`; make sure Express still sees the full `/api/…` URL in case
// the platform strips it, then hand off to the shared handler.
const handler = require('./_handler');

module.exports = async function catchAll(req, res) {
  const segments = Array.isArray(req.query?.path) ? req.query.path : req.query?.path ? [req.query.path] : [];
  if (segments.length && !String(req.url || '').startsWith('/api/')) {
    const queryIndex = (req.url || '').indexOf('?');
    const qs = queryIndex >= 0 ? req.url.slice(queryIndex) : '';
    req.url = `/api/${segments.join('/')}${qs}`;
  }
  if (req.query && 'path' in req.query) delete req.query.path;
  return handler(req, res);
};
