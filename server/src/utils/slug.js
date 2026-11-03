const crypto = require('crypto');

function slugify(value) {
  const slug = String(value || '')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 70);
  return slug || `entry-${crypto.randomBytes(3).toString('hex')}`;
}

// Produce a slug that is unique for a model without relying on a race-prone
// "check then insert" alone. The unique index remains the final guard.
async function uniqueSlug(Model, title, excludeId = null) {
  const base = slugify(title);
  let candidate = base;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const query = { slug: candidate };
    if (excludeId) query._id = { $ne: excludeId };
    const exists = await Model.exists(query);
    if (!exists) return candidate;
    candidate = `${base}-${crypto.randomBytes(2).toString('hex')}`;
  }
  return `${base}-${Date.now().toString(36)}`;
}

module.exports = { slugify, uniqueSlug };
