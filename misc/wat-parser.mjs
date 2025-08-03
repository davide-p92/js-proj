import fs from 'fs/promises';

const watFile = process.argv[2] || 'module.wat';
const wat = await fs.readFile(watFile, 'utf8');

// Extract types
const typeRegex = /\(type\s*;\s*(\d+)\s*;\)\s*\(func\s*(.*?)\)/g;
const types = {};
let match;

console.log(wat.slice(0, 500));

while ((match = typeRegex.exec(wat)) !== null) {
  const index = match[1];
  const signature = match[2].replace(/\s+/g, ' ').trim();
  types[index] = signature;
}

// Extract imports and match types
const importRegex = /\(import\s*"([^"]+)"\s*"([^"]+)"\s*\(func\s*;\s*(\d+)\s*;\)\s*\(type\s+(\d+)\)\)/g;

console.log(`📦 Found imported functions:\n`);
while ((match = importRegex.exec(wat)) !== null) {
  const [_, mod, name, funcIndex, typeIndex] = match;
  const signature = types[typeIndex] || '(unknown)';
  console.log(`🔹 ${name} (from "${mod}")`);
  console.log(`   → function index: ${funcIndex}`);
  console.log(`   → type index: ${typeIndex}`);
  console.log(`   → signature: ${signature}\n`);
}

