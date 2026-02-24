const fs = require("fs");
const path = require("path");

const sourceDir = path.join(__dirname, ".."); 
const targetDir = path.join(__dirname, "..", "..", "shareAMeal-v2"); 

const excludePatterns = [
	"node_modules",
	".git",
	"coverage",
	".env",
	".env.local",
	"test-output.txt",
	"docs", 
	"scripts/sync-to-v2.js", 
	/^tmpclaude-/,
	/\.log$/,
];

function stripComments(code) {
	let result = "";
	let i = 0;
	let inString = null;
	let inLineComment = false;
	let inBlockComment = false;

	while (i < code.length) {
		const char = code[i];
		const nextChar = code[i + 1] || "";
		const prevChar = code[i - 1] || "";

		if (!inLineComment && !inBlockComment) {
			if ((char === '"' || char === "'" || char === "`") && prevChar !== "\\") {
				if (inString === null) {
					inString = char;
				} else if (inString === char) {
					inString = null;
				}
				result += char;
				i++;
				continue;
			}
		}

		// If we're in a string, preserve everything
		if (inString) {
			result += char;
			i++;
			continue;
		}

		// Start of line comment
		if (!inBlockComment && char === "/" && nextChar === "/") {
			inLineComment = true;
			i += 2;
			continue;
		}

		// End of line comment
		if (inLineComment && char === "\n") {
			inLineComment = false;
			result += char; // Keep the newline
			i++;
			continue;
		}

		// Start of block comment
		if (!inLineComment && char === "/" && nextChar === "*") {
			inBlockComment = true;
			i += 2;
			continue;
		}

		// End of block comment
		if (inBlockComment && char === "*" && nextChar === "/") {
			inBlockComment = false;
			i += 2;
			continue;
		}

		// Skip characters inside comments
		if (inLineComment || inBlockComment) {
			i++;
			continue;
		}

		// Normal character - add to result
		result += char;
		i++;
	}

	// Clean up extra blank lines created by comment removal
	return (
		result
			.replace(/\n\s*\n\s*\n/g, "\n\n") // Max 2 consecutive newlines
			.replace(/^\s*\n/, "") // Remove leading blank lines
			.trim() + "\n"
	);
}

/**
 * Check if path should be excluded
 */
function shouldExclude(filePath) {
	const relativePath = path.relative(sourceDir, filePath);
	return excludePatterns.some((pattern) => {
		if (pattern instanceof RegExp) {
			return pattern.test(path.basename(filePath));
		}
		return relativePath.includes(pattern);
	});
}

/**
 * Copy directory recursively
 */
function syncDirectory(src, dest) {
	let filesCopied = 0;
	let jsFilesProcessed = 0;

	function copyRecursive(srcPath, destPath) {
		if (shouldExclude(srcPath)) {
			return;
		}

		const stats = fs.statSync(srcPath);

		if (stats.isDirectory()) {
			// Create directory if it doesn't exist
			if (!fs.existsSync(destPath)) {
				fs.mkdirSync(destPath, { recursive: true });
			}

			// Copy all contents
			const entries = fs.readdirSync(srcPath);
			entries.forEach((entry) => {
				copyRecursive(path.join(srcPath, entry), path.join(destPath, entry));
			});
		} else if (stats.isFile()) {
			const ext = path.extname(srcPath);
			let content = fs.readFileSync(srcPath, "utf8");

			// Strip comments from .js files only
			if (ext === ".js") {
				content = stripComments(content);
				jsFilesProcessed++;
			}

			// Write to destination
			fs.writeFileSync(destPath, content, "utf8");
			filesCopied++;
		}
	}

	copyRecursive(src, dest);
	return { filesCopied, jsFilesProcessed };
}

/**
 * Main sync function
 */
function main() {
	console.log("\n🔄 SYNCING shareAMeal → shareAMeal-v2\n");
	console.log("Source:", sourceDir);
	console.log("Target:", targetDir);
	console.log("");

	// Ensure target directory exists
	if (!fs.existsSync(targetDir)) {
		fs.mkdirSync(targetDir, { recursive: true });
		console.log("✅ Created shareAMeal-v2 directory\n");
	}

	// Perform sync
	const startTime = Date.now();
	const { filesCopied, jsFilesProcessed } = syncDirectory(sourceDir, targetDir);
	const duration = ((Date.now() - startTime) / 1000).toFixed(2);

	console.log("\n✅ SYNC COMPLETE\n");
	console.log(`   Files copied: ${filesCopied}`);
	console.log(`   JS files processed (comments removed): ${jsFilesProcessed}`);
	console.log(`   Duration: ${duration}s`);
	console.log("");
	console.log("📋 What was synced:");
	console.log("   ✅ Source code (src/)");
	console.log("   ✅ Tests (tests/)");
	console.log("   ✅ Config files (package.json, render.yaml, etc.)");
	console.log("   ✅ Database migrations (db/)");
	console.log("   ✅ Scripts (scripts/)");
	console.log("");
	console.log("📋 What was excluded:");
	console.log("   ⏭️  node_modules/");
	console.log("   ⏭️  .env files");
	console.log("   ⏭️  docs/ (kept separate per directory)");
	console.log("   ⏭️  Temporary files");
	console.log("");
	console.log("🎯 shareAMeal-v2 is now production-ready (no comments)!\n");
}

// Run if called directly
if (require.main === module) {
	try {
		main();
	} catch (error) {
		console.error("\n❌ ERROR during sync:", error.message);
		process.exit(1);
	}
}

module.exports = { stripComments, syncDirectory };
