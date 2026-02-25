const fs = require("fs");
const http = require("http");
const https = require("https");
const { URL } = require("url");

function downloadFile(fileUrl, outputPath) {
	return new Promise((resolve, reject) => {
		const urlObj = new URL(fileUrl);
		const lib = urlObj.protocol === "https:" ? https : http;
		const req = lib.get(urlObj, (res) => {
			if (res.statusCode >= 400)
				return reject(new Error("Failed to download file: " + res.statusCode));
			const fileStream = fs.createWriteStream(outputPath);
			res.pipe(fileStream);
			fileStream.on("finish", () => fileStream.close(resolve));
			fileStream.on("error", (err) => reject(err));
		});
		req.on("error", reject);
	});
}

async function downloadModel() {
	const modelUrl = process.env.MODEL_URL;
	const outPath =
		process.env.MODEL_LOCAL_PATH || "./backend/ml/food_status_model.pkl";
	if (!modelUrl) {
		console.log("MODEL_URL not set — skipping download");
		return null;
	}
	try {
		console.log(`Downloading model from ${modelUrl} to ${outPath}`);
		await downloadFile(modelUrl, outPath);
		console.log("Model downloaded successfully");
		return outPath;
	} catch (err) {
		console.error("Model download failed:", err.message);
		throw err;
	}
}

module.exports = { downloadModel };

if (require.main === module) {
	downloadModel().catch((e) => {
		console.error(e);
		process.exit(1);
	});
}
