#!/usr/bin/env node

const mysql = require("mysql2/promise");
const fs = require("fs");
const path = require("path");

require("dotenv").config();

async function runMigration() {
	let connection;

	try {
		console.log("🔄 Starting database migration...");
		console.log(
			`📍 Connecting to ${process.env.DB_HOST}:${process.env.DB_PORT || 3306}`,
		);

		const config = {
			host: process.env.DB_HOST || "localhost",
			port: process.env.DB_PORT || 3306,
			user: process.env.DB_USER || "root",
			password: process.env.DB_PASSWORD || process.env.DB_PASS || "",
		};

		if (process.env.DB_SSL === "true") {
			config.ssl = {
				rejectUnauthorized: true,
			};

			if (process.env.DB_CA_CERT) {
				config.ssl.ca = process.env.DB_CA_CERT;
				console.log("🔐 Using CA certificate from environment variable");
			} else {
				console.warn(
					"⚠️  DB_SSL=true but no DB_CA_CERT provided. Connection may fail if certificate validation is required.",
				);
			}
		}

		connection = await mysql.createConnection(config);

		console.log(
			"✅ Connected to MySQL (SSL: " +
				(process.env.DB_SSL === "true" ? "enabled" : "disabled") +
				")",
		);

		const dbName = process.env.DB_NAME || "sharemeal";
		console.log(`📦 Creating database '${dbName}' if not exists...`);
		await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\``);
		await connection.query(`USE \`${dbName}\``);
		console.log(`✅ Using database '${dbName}'`);

		const schemaPath = path.join(__dirname, "../db/migrations/shareAMeal.sql");

		if (!fs.existsSync(schemaPath)) {
			throw new Error(`Schema file not found at ${schemaPath}`);
		}

		const schema = fs.readFileSync(schemaPath, "utf8");

		const statements = schema
			.split(";")
			.map((stmt) => stmt.trim())
			.filter((stmt) => stmt.length > 0);

		console.log(`📄 Running ${statements.length} SQL statements...`);

		for (const statement of statements) {
			try {
				await connection.query(statement);
			} catch (error) {
				if (!error.message.includes("already exists")) {
					throw error;
				}
			}
		}

		console.log("✅ Database schema migration completed successfully!");
		process.exit(0);
	} catch (error) {
		console.error("❌ Migration failed:", error.message);
		process.exit(1);
	} finally {
		if (connection) {
			await connection.end();
		}
	}
}

runMigration();
