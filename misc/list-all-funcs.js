import fs from 'fs/promises';

const watFile = process.argv[2] || 'module.wat';
const wat = await fs.readFile(watFile, 'utf8');

// 1. Parse types
const typeRegex = /\(type\s+(\$\w+)\s+\(func\s*((?:\(param[^\)]*\)\s*)*(?:\(result[^\)]*\))?)\s*\)\)/g;
const types = {};
let match;
while ((match = typeRegex.exec(wat)) !== null) {
  const [_, typeName, sig] = match;
  types[typeName] = sig.trim().replace(/\s+/g, ' ');
}

// 2. Parse function declarations
const funcRegex = /\(func\s+(\$\w+)\s+\(type\s+(\$\w+)\)/g;
const funcs = {};
while ((match = funcRegex.exec(wat)) !== null) {
  const [_, funcName, typeRef] = match;
  funcs[funcName] = typeRef;
}

// 3. Parse exports
const exportRegex = /\(export\s+"([^"]+)"\s+\(func\s+(\$\w+)\)\)/g;
const exports = {};
while ((match = exportRegex.exec(wat)) !== null) {
  const [_, exportName, funcName] = match;
  exports[funcName] = exportName;
}

// 4. Display
console.log("📤 Exported Functions:");
for (const [funcName, exportName] of Object.entries(exports)) {
  const sig = types[funcs[funcName]] || '(unknown signature)';
  console.log(`- ${exportName.padEnd(8)} → ${funcName}: ${sig}`);
}

console.log("\n🔒 Internal Functions:");
for (const funcName of Object.keys(funcs)) {
  if (!exports[funcName]) {
    const sig = types[funcs[funcName]] || '(unknown signature)';
    console.log(`- ${funcName}: ${sig}`);
  }
}

