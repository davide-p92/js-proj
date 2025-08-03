const fs = require('fs')

async function downloadWasm(url, outputPath) {
	try {
		console.log(`Fetching Wasm from: ${url}`);
		const response = await fetch(url);
		if(!response.ok) throw new Error(`HTTP error. Status: ${response.status}`);

		const buffer = await response.arrayBuffer();
		fs.writeFileSync(outputPath, Buffer.from(buffer));
		console.log(`Saved Wasm to: ${outputPath}`);
	} catch(err) {
		console.error("Error: ", err.message);
	}
}

//cmd line args: node server.js <url> <output_file>
const [url, output] = process.argv.slice(2);

if(!url || !output) {
	console.log("Usage: node download-wasm.js <url> <output_file>");
	process.exit(1);
}

downloadWasm(url, output);
