const mysql = require("mysql2/promise");

require("dotenv").config();

const pool = mysql.createPool({
	host: process.env.DB_HOST || "localhost",
	port: process.env.DB_PORT || 3306,
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD || process.env.DB_PASS,
	database: process.env.DB_NAME || "sharemeal",
	waitForConnections: true,
	connectionLimit: 10,
	queueLimit: 0,
	connectTimeout: 10000, // 10 seconds to connect
	enableKeepAlive: true,
	keepAliveInitialDelay: 0,
	...(process.env.DB_SSL === "true" && {
		ssl: {
			rejectUnauthorized: true,
			ca: process.env.DB_CA_CERT, // full multi-line certificate
		},
	}),
});

console.log("✅ Database pool created with host:", process.env.DB_HOST);

module.exports = pool;
