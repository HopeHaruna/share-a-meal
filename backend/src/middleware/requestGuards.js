const rateLimit = require("express-rate-limit");
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

/**
 * Production-safe Rate Limiter
 * - Handles memory cleanup internally
 * - Supports proxy IPs
 * - Sends standard rate limit headers
 */
const rateLimiter = rateLimit({
	windowMs: RATE_LIMIT_WINDOW_MS,
	max: RATE_LIMIT_MAX,
	standardHeaders: true,
	legacyHeaders: false,
	skip: (req) => req.method === "OPTIONS",

	handler: (req, res, next, options) => {
		next(
			new AppError(
				"Too many requests. Please try again later.",
				429,
				"RATE_LIMITED",
				{
					retry_after_seconds: Math.ceil(options.windowMs / 1000),
				},
			),
		);
	},
});
const loginLimiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 mins
	max: 5, // only 5 login attempts
	standardHeaders: true,
	legacyHeaders: false,
	handler: (req, res, next) => {
		next(
			new AppError(
				"Too many login attempts. Try again later.",
				429,
				"LOGIN_RATE_LIMIT",
			),
		);
	},
});

/**
 * Request timeout protection
 * Prevents long-hanging requests (DoS mitigation)
 */
const requestTimeout = (req, res, next) => {
	res.setTimeout(REQUEST_TIMEOUT_MS, () => {
		if (!res.headersSent) {
			next(new AppError("Request timed out", 408, "REQUEST_TIMEOUT"));
		}
	});

	next();
};

module.exports = { rateLimiter, requestTimeout, loginLimiter };
