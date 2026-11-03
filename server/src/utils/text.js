// Escape user input before using it inside a regular expression. Without this,
// a query like `(` would make MongoDB throw a syntax error.
function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function readingTime(content = '') {
  const words = String(content)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`~\-[\]()]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 200));
}

function makeExcerpt(content = '', length = 180) {
  const plain = String(content)
    .replace(/```[\s\S]*?```/g, ' ')
    .replace(/[#>*_`~]/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/\s+/g, ' ')
    .trim();
  if (plain.length <= length) return plain;
  return `${plain.slice(0, length).replace(/\s+\S*$/, '')}…`;
}

module.exports = { escapeRegex, readingTime, makeExcerpt };
