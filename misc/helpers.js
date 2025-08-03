const fs = require("fs");
const https = require("https");

function downloadFile(url, dest) {
	return new Promise((resolve, reject) => {
		const file = fs.createWriteStream(dest);
		https.get(url, (response) => {
			if(response.statusCode !== 200) {
				reject(new Error(`Failed to get '${url} (${response.statusCode})`));
				return;
			}

			response.pipe(file);
			file.on("finish", ()=> file.close(resolve));
		}).on("error", reject);
	});
}

module.exports = downloadFile;
