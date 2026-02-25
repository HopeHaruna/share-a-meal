const { AppError } = require("./errorHandler");

const RATE_LIMIT_WINDOW_MS = parseInt(
	process.env.RATE_LIMIT_WINDOW_MS || "900000",
	10,
);
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX || "300", 10);
const REQUEST_TIMEOUT_MS = parseInt(
	process.env.REQUEST_TIMEOUT_MS || "15000",
	10,
);

const rateStore = new Map();

const rateLimiter = (req, res, next) => {
	const now = Date.now();
	const key = req.ip || req.connection?.remoteAddress || "unknown";
	const entry = rateStore.get(key);

	if (!entry || now > entry.resetAt) {
		rateStore.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
		return next();
	}

	entry.count += 1;
	if (entry.count > RATE_LIMIT_MAX) {
		return next(
			new AppError(
				"Too many requests. Please try again later.",
				429,
				"RATE_LIMITED",
				{ retry_after_ms: entry.resetAt - now },
			),
		);
	}

	return next();
};

const requestTimeout = (req, res, next) => {
	res.setTimeout(REQUEST_TIMEOUT_MS, () => {
		if (!res.headersSent) {
			return next(new AppError("Request timed out", 408, "REQUEST_TIMEOUT"));
		}
	});

	return next();
};

module.exports = { rateLimiter, requestTimeout };
