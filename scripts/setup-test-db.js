const fs = require("fs");
const path = require("path");
const mysql = require("mysql2/promise");

require("dotenv").config();

const MIGRATION_PATH = path.resolve(
	__dirname,
	"..",
	"db",
	"migrations",
	"shareAMeal.sql",
);

const TEST_DB_NAME = process.env.DB_NAME_TEST || "sharemeal_test";

const config = {
	host: process.env.DB_HOST || "localhost",
	user: process.env.DB_USER || "root",
	password: process.env.DB_PASSWORD || "",
	port: Number(process.env.DB_PORT || 3306),
};

const sanitizeSql = (sql) => {
	
	let updated = sql.replace(
		/CREATE\s+DATABASE\s+IF\s+NOT\s+EXISTS\s+sharemeal\s*;/i,
		`CREATE DATABASE IF NOT EXISTS ${TEST_DB_NAME};`,
	);
	updated = updated.replace(
		/USE\s+sharemeal\s*;/i,
		`USE ${TEST_DB_NAME};`,
	);

	return updated;
};

const splitStatements = (sql) => {
	return sql
		.split(/;\s*\n/)
		.map((statement) => statement.trim())
		.filter(Boolean);
};

const run = async () => {
	if (!fs.existsSync(MIGRATION_PATH)) {
		throw new Error(`Migration file not found: ${MIGRATION_PATH}`);
	}

	const rawSql = fs.readFileSync(MIGRATION_PATH, "utf8");
	const sql = sanitizeSql(rawSql);
	const statements = splitStatements(sql);

	if (statements.length === 0) {
		throw new Error("No SQL statements found in migration file.");
	}

	const connection = await mysql.createConnection(config);

	try {
		for (const statement of statements) {
			await connection.query(statement);
		}
		console.log(`Test database '${TEST_DB_NAME}' is ready.`);
	} finally {
		await connection.end();
	}
};

run().catch((error) => {
	console.error("Failed to set up test database:", error.message);
	process.exit(1);
});
