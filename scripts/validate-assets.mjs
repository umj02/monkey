import fs from 'node:fs';
import path from 'node:path';

const assetFile = path.join(process.cwd(), 'lib', 'asset-library.ts');
const source = fs.readFileSync(assetFile, 'utf8');
const refs = [...source.matchAll(/src:\s*"([^"]+)"/g)].map((match) => match[1]);
const missing = refs.filter((ref) => ref.startsWith('/assets/')).filter((ref) => !fs.existsSync(path.join(process.cwd(), 'public', ref)));

if (missing.length) {
  console.error('Missing asset files:');
  for (const item of missing) console.error(`- ${item}`);
  process.exit(1);
}

console.log(`Assets OK: ${refs.length} references validated.`);
