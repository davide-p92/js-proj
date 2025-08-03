const fs = require("fs");

const args = process.argv.slice(2);
let f_name;
if(!args[0]) {
        console.log("Usage: node cli-parser.js <url>");
        process.exit(1);
}
f_name = args[0];

const wat = fs.readFileSync(f_name, "utf8");

const exports = wat.match(/\(export\s+"[^"]+"/g) || [];
const imports = wat.match(/\(import\s+"[^"]+"/g) || [];

console.log("🔎 Exported items:", exports.map(e => e.slice(9)));
console.log("🌐 Imported modules:", imports.map(i => i.slice(9)));

