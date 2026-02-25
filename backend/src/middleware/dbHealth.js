const pool = require("../config/db");
const { AppError } = require("./errorHandler");

const CHECK_INTERVAL_MS = parseInt(
	process.env.DB_HEALTH_CHECK_INTERVAL_MS || "10000",
	10,
);

let lastCheckAt = 0;
let lastOk = true;

const dbHealth = async (req, res, next) => {
	const now = Date.now();

	if (now - lastCheckAt < CHECK_INTERVAL_MS) {
		if (!lastOk) {
			return next(new AppError("Database unavailable", 503, "DB_UNAVAILABLE"));
		}
		return next();
	}

	lastCheckAt = now;
	try {
		await pool.query("SELECT 1");
		lastOk = true;
		return next();
	} catch (error) {
		lastOk = false;
		return next(new AppError("Database unavailable", 503, "DB_UNAVAILABLE"));
	}
};

module.exports = { dbHealth };
