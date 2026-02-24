const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");
require("dotenv").config();

const dbName = process.argv[2] || process.env.DB_NAME;

async function runMigration() {
	
	const pool = mysql.createPool({
		host: process.env.DB_HOST || "localhost",
		user: process.env.DB_USER || "root",
		password: process.env.DB_PASSWORD,
		database: dbName,
		waitForConnections: true,
		connectionLimit: 10,
		queueLimit: 0,
	});

	try {
		console.log(`📦 Starting migration on database: ${dbName}`);
		console.log("   Rename 'restaurant' role to 'sme'...");

		const migrationSQL = fs.readFileSync(
			path.join(__dirname, "../db/migrations/002_rename_restaurant_to_sme.sql"),
			"utf8",
		);

		const statements = migrationSQL
			.split(";")
			.map((s) => {
				
				return s
					.split("\n")
					.map((line) => line.trim())
					.filter((line) => line.length > 0 && !line.startsWith("--"))
					.join(" ");
			})
			.filter((s) => s.length > 0);

		console.log(`\n📝 Found ${statements.length} SQL statements to execute\n`);

		for (const statement of statements) {
			if (statement.toUpperCase().includes("USE ")) {
				
				console.log(`Skipping USE statement: ${statement.substring(0, 40)}...`);
				continue;
			}
			console.log(`Executing: ${statement.substring(0, 80)}...`);
			await pool.query(statement);
			console.log("  ✓ Success");
		}

		console.log("✅ Migration completed successfully!");
		console.log("\n📊 Verifying changes:");

		const [users] = await pool.query(
			"SELECT role, COUNT(*) as count FROM users GROUP BY role",
		);
		console.table(users);

		await pool.end();
		process.exit(0);
	} catch (error) {
		console.error("❌ Migration failed:", error.message);
		await pool.end();
		process.exit(1);
	}
}

runMigration();
