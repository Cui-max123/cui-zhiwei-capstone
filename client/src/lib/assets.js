// Resolve a public-asset reference. Seed data stores cover paths as `/covers/...`;
// on GitHub Pages the site lives under a base path, so relative paths must be
// prefixed. External URLs (https://, //) pass through untouched.
export function asset(src) {
  if (!src) return '';
  if (src.startsWith('//') || /^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/')) {
    const base = import.meta.env.BASE_URL.replace(/\/+$/, '');
    return `${base}${src}`;
  }
  return src;
}
