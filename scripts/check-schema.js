const mysql = require("mysql2/promise");
require("dotenv").config();

async function checkSchema() {
	const dbName = process.argv[2] || process.env.DB_NAME;
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
		console.log(`\n📊 Checking schema for database: ${dbName}\n`);

		const [columns] = await pool.query(
			`SHOW COLUMNS FROM users WHERE Field = 'role'`,
		);

		console.log("Role column definition:");
		console.table(columns);

		const [users] = await pool.query(
			"SELECT role, COUNT(*) as count FROM users GROUP BY role",
		);

		console.log("\nUser role distribution:");
		console.table(users);

		await pool.end();
		process.exit(0);
	} catch (error) {
		console.error("❌ Error:", error.message);
		await pool.end();
		process.exit(1);
	}
}

checkSchema();
