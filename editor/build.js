//build.js
const esbuild = require('esbuild');

esbuild.build({
	entryPoints: ["./bundle-entry.js"],
	bundle: true,
	outfile: 'public/bundle.js',
	format: 'esm',
	target: 'es2024',
	loader: {
		'.js': 'js',
	},
	external: [],
}).catch(() => process.exit(1));
