// Minimal MongoDB operator-injection guard. Mongoose already casts and strips
// unknown schema paths, but rejecting `$`/`.` keys early keeps query objects and
// future schemas safe without adding another dependency.
function clean(value) {
  if (Array.isArray(value)) return value.map(clean);
  if (!value || typeof value !== 'object') return value;

  const result = {};
  for (const [key, item] of Object.entries(value)) {
    if (key.startsWith('$') || key.includes('.')) continue;
    result[key] = clean(item);
  }
  return result;
}

module.exports = function sanitize(req, _res, next) {
  if (req.body) req.body = clean(req.body);
  if (req.params) req.params = clean(req.params);
  if (req.query) {
    for (const key of Object.keys(req.query)) {
      if (key.startsWith('$') || key.includes('.')) delete req.query[key];
    }
  }
  next();
};
