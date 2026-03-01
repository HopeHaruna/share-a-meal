const dotenv = require("dotenv");
const path = require("path");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);
// Load test environment variables BEFORE anything else
dotenv.config({ path: path.join(__dirname, "../.env.test") });

// Increase timeout for tests
jest.setTimeout(30000);

// Setup test database before all tests
beforeAll(async () => {
	console.log("🔧 Setting up test database...");
	try {
		// Run migrations on test database
		await execPromise("node scripts/migrate.js", {
			env: { ...process.env, NODE_ENV: "test" },
		});
		console.log("✅ Test database ready");
	} catch (error) {
		console.error("❌ Failed to setup test database:", error);
	}
});

// Clean up after tests
afterAll(async () => {
	// Optional: drop test database or clean up
	console.log("✅ Test cleanup complete");
});
