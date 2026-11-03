// Smoke test: confirms the built client is present and the API answers.
// Usage: node scripts/smoke.mjs
import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const base = (process.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

async function main() {
  const distIndex = join(root, 'dist', 'index.html');
  if (!existsSync(distIndex)) {
    console.error('dist/index.html is missing — run `npm run build` first.');
    process.exit(1);
  }

  const html = await readFile(distIndex, 'utf8');
  if (!html.includes('id="root"')) {
    console.error('dist/index.html does not look like the built app.');
    process.exit(1);
  }

  let health;
  try {
    const response = await fetch(`${base}/health`);
    health = await response.json();
  } catch (error) {
    console.error(`Could not reach the API at ${base}: ${error.message}`);
    process.exit(1);
  }

  if (health?.success !== true) {
    console.error(`Unexpected health response: ${JSON.stringify(health)}`);
    process.exit(1);
  }

  console.log(`Build present (${html.length} bytes) and API healthy at ${base}.`);
}

main();
