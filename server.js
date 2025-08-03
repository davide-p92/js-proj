const express = require('express');
const multer = require('multer');
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const app = express();
//const upload = multer({ dest: 'uploads/' });
const PORT = 3333;

//Ensure the storage is using a .c file to be given the emcc
const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, "uploads/"),
	filename: (req, file, cb) => cb(null, file.originalname),
});

const upload = multer({ storage });

//Serve static files (frontend)
app.use(express.static('public'));

//Additional route for the edit.
app.get('/editor.html', (req, res) => {
  	res.sendFile(path.join(__dirname, 'editor/editor.html'));
});

//.and for index
app.get('/index.html', (req, res) => {
	res.sendFile(path.join(__dirname, 'editor/index.html'));
});

//Endpoint for file conversion
app.post('/convert', upload.single('file'), (req, res) => {
	if(!req.file) return res.status(400).send("No file uploaded");

	const uploadedPath = req.file.path;
	
	const unsupportedHeaders = [
		'<sys/', '<unistd.h>', '<fcntl.h>', '<spawn.h>', '<pty.h>', '<netinet/', '<linux/', '<arpa/', '<termios.h>', '<signal.h>', '<poll.h>', '<syscall.h>', '<pwd.h>', '<grp.h>'
	];
	const contents = fs.readFileSync(uploadedPath, 'utf8');

	//if (contents.includes('#include <sys/') || contents.includes('#include "')) {
  	if(unsupportedHeaders.some(h => contents.includes(`#include ${h}`))) {
		return res.status(400).send("C file uses unsupported system headers.");
	}


	const baseName = path.basename(uploadedPath);
	const wasmOut = `uploads/${baseName}.wasm`;
	const watOut = `uploads/${baseName}.wat`;

	const emccCmd = `emcc ${uploadedPath} -o ${wasmOut} -s STANDALONE_WASM`;
	const watCmd = `wasm2wat ${wasmOut} -o ${watOut}`;

	//Step 1: Compile to WASM
	exec(emccCmd, (err, stdout, stderr) => {
		if (err) {
			console.error("emcc error:", stderr);
			return res.status(500).send(`emcc failed: ${err.message}`);
		}

		//Step 2: Convert to WAT
		exec(watCmd, (err) => {
			if (err) {
				console.error("wasm2wat error:", stderr);
				return res.status(500).send(`wasm2wat failed: ${err.message}`);
			}

			//Step 3: Send WAT content
			/*fs.readFile(watOut, 'utf8', (err, watData) => {
			
			if (err) {
				console.error("readFile error:", stderr);
				return res.status(500).send(`Failed to read WAT: ${err.message}`);
			}*/
			const archiver = require('archiver');
			const archive = archiver('zip', { zlib: { level: 9 } });

			res.set("Content-Type", "application/zip");
			const baseNameNoExt = path.basename(uploadedPath, '.c');
			res.set("Content-Disposition", `attachment; filename="${baseNameNoExt}.zip"`);
			/*res.send(watData);
				//Optional: cleanup
			fs.unlink(uploadedPath, () => {});
			fs.unlink(wasmOut, () => {});
			fs.unlink(watOut, () => {});
//			});*/
			archive.pipe(res);

			//Add files
			archive.file(watOut, { name: `${baseName}.wat` });
			archive.file(wasmOut, { name: `${baseName}.wasm` });
			//Option. include source
			archive.file(uploadedPath, { name: baseName });

			archive.finalize();

			archive.on('close', () => {
				fs.unlink(uploadedPath, () => {});
				fs.unlink(wasmOut, () => {});
				fs.unlink(watOut, () => {});
			});

			archive.on('error', (err) => {
				console.error('Archive error:', err);
				res.status(500).send('Failed to create ZIP');
			});
		});
	});
});

const bodyParser = require('body-parser');
//Accept raw WAT text
app.use(bodyParser.text({ type: 'text/plain', limit: '1mb' }));
app.post('/compile-wat', (req, res) => {
	const watSource = req.body;

	if(!watSource || typeof watSource !== 'string') {
		return res.status(400).send('Invalid WAT input');
	}

	const baseName = `manual_input_${Date.now()}`;
	const watFile = `uploads/${baseName}`;
	const wasmOut = `uploads/${baseName}`;

	//Save WAT source to file
	fs.writeFileSync(watFile, watSource, 'utf-8');
	const wat2wasmCmd = `wat2wasm ${watFile} -o ${wasmOut}`;

	exec(wat2wasmCmd, (err, stdout, stderr) => {
		if(err) {
			console.error("wat2wasm error: ", stderr);
			return res.status(500).send(`wat2wasm failure: ${err.message}`);
		}

		const archiver = require('archiver');
		const archive = archiver('zip', { zlib: { level: 9 } });
		res.set("Content-Type", "application/zip");
		res.set("Content-Disposition", `attachment; filename=${baseName}.zip`);
		archive.pipe(res);
		archive.file(watFile, { name: `${baseName}.wat` });
		archive.file(wasmOut, { name: `${baseName}.wasm` });
		archive.finalize();

		//Cleanup (opt)
		fs.unlink(watFile);
		fs.unlink(wasmOut);
	});
});


app.listen(PORT, () => {
	console.log(`Server running at http://localhost:${PORT}`);
});
