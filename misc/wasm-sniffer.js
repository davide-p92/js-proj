const fs = require("fs");
const https = require("https");
const puppeteer = require("puppeteer");
const downloadFile = require("./helpers.js");

async function Sniff(arg_url) {
	let browser;
	try {
		browser = await puppeteer.launch({
			headless: "new", //use false if thou wanst to see the browser
			args: ["--no-sandbox", "--disable-setuid-sandbox"],
			//defaultViewport: null,
		});

		const page = await browser.newPage();

		//Intercept reqs
		await page.setRequestInterception(true);
		page.on("request", (req) => req.continue());

		page.on("response", async (res) => {
			const url = res.url();
			const headers = res.headers();
			const contentType = headers["content-type"] || "";

			if (url.endsWith(".wasm") || contentType.includes("application/wasm")) {
				console.log("Found Wasm file: ", url);
				const filename = url.split("/").pop().split("?")[0] || "module.wasm";
				try {
					await downloadFile(url, `./${filename}`);
					console.log(`Downloaded: ${filename}`);
				}
				catch (err) {
					console.error(`Failed to download ${url}: ${err.message}`);
				}
			}
		});

		console.log(`Navigating to ${arg_url}`);
		await page.goto(arg_url, { waitUntil: "networkidle2" });
	
		console.log("Waiting for potential WASM modules to load...");
		await new Promise(resolve => setTimeout(resolve, 8000));

		//await browser.close();
	} catch (err) {
		console.error("Error: ", err.message);
	} finally {
		if (browser) await browser.close();
	}
}

const uargs = process.argv.slice(2); //Only get user arguments

if(!uargs[0]) {
	console.log("Usage: node wasm-sniffer.js <url>");
	process.exit(1);
}

Sniff(uargs[0]);
