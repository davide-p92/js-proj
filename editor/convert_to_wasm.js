const fileInput = document.getElementById("myfile");
const output = document.getElementById("wasm-output");
const btnWat = document.getElementById("download-wat");
const btnZip = document.getElementById("download-zip");

let currentWatText = ""; //Store WAT output for download
let currentZipBlob = null;
let currentWatFilename = '';

fileInput.addEventListener('change', async (event) => {
	const file = event.target.files[0];
	if(!file) {
		output.textContent = 'No file selected.';
		return;
	}

	//originalFilename = file.name.replace(/\.c$/, '');
	output.textContent = 'Uploading and converting...';
	btnWat.disabled = true;
	btnZip.disabled = true;

	const formData = new FormData();
	formData.append('file', file);

	try {
		//console.log(`formData=${formData}`);
		const response = await fetch('/convert', {
			method: 'POST',
			body: formData,
		});

		if(!response || !response.ok) {
			throw new Error(`Server error: ${response.statusText}`);
		}

		const zipBlob = await response.blob();
		currentZipBlob = zipBlob;

		const zip = await JSZip.loadAsync(zipBlob);
		const watFileEntry = Object.values(zip.files).find(f => f.name.endsWith('.wat'));

		if(!watFileEntry) {
			throw new Error('WAT file not found in ZIP');
		}

		const watText = await watFileEntry.async('text');
		//output.textContent = watText;
		currentWatText = watText;
		currentWatFilename = watFileEntry.name;
		output.textContent = watText;

		output.textContent = watText;

		btnWat.disabled = false;
		btnZip.disabled = false;
		//console.log(`watText: ${watText}`);
	
	} catch(err) {
		output.textContent = `Conversion failed: ${err.message}`;
		console.error(err);
	}
});

btnWat.addEventListener('click', () => {
	if (!currentWatText) return;
	const blob = new Blob([currentWatText], { type: 'text/plain' });
	const a = document.createElement('a');
	a.href = URL.createObjectURL(blob);
	a.download = currentWatFilename || 'output.wat';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
});

btnZip.addEventListener('click', () => {
	if (!currentZipBlob) return;
	const a = document.createElement('a');
	a.href = URL.createObjectURL(currentZipBlob);
	a.download = 'bundle.zip';
	document.body.appendChild(a);
	a.click();
	document.body.removeChild(a);
});
