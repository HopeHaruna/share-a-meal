const classifyError = (error) => {
	
	if (error.name === 'ValidationError' || error.code === 'INVALID_PARAM') {
		return {
			statusCode: 400,
			message: error.message || 'Validation failed',
			code: 'VALIDATION_ERROR',
			details: error.details || null
		};
	}

	if (error.name === 'JsonWebTokenError') {
		return {
			statusCode: 401,
			message: 'Invalid authentication token',
			code: 'JWT_INVALID',
			details: null
		};
	}

	if (error.name === 'TokenExpiredError') {
		return {
			statusCode: 401,
			message: 'Authentication token has expired',
			code: 'JWT_EXPIRED',
			details: null
		};
	}

	if (error.code === 'ETIMEDOUT' || error.name === 'TimeoutError') {
		return {
			statusCode: 408,
			message: 'Request timeout',
			code: 'REQUEST_TIMEOUT',
			details: null
		};
	}

	if (error.code === 'RATE_LIMITED') {
		return {
			statusCode: 429,
			message: 'Too many requests',
			code: 'RATE_LIMITED',
			details: { retry_after_ms: error.retryAfter || 60000 }
		};
	}

	if (error.code === 'DB_UNAVAILABLE') {
		return {
			statusCode: 503,
			message: 'Service temporarily unavailable',
			code: 'DB_UNAVAILABLE',
			details: null
		};
	}

	if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
		return {
			statusCode: 502,
			message: 'Bad gateway',
			code: 'BAD_GATEWAY',
			details: null
		};
	}

	if (error.name === 'TypeError' || error.name === 'ReferenceError') {
		return {
			statusCode: 500,
			message: 'Internal server error',
			code: 'INTERNAL_SERVER_ERROR',
			details: null
		};
	}

	return {
		statusCode: 500,
		message: error.message || 'Internal server error',
		code: 'UNKNOWN_ERROR',
		details: null
	};
};

const catchAsync = (fn) => {
	return (req, res, next) => {
		fn(req, res, next).catch((error) => {
			
			const classified = classifyError(error);

			const response = {
				status: classified.statusCode,
				message: classified.message,
				code: classified.code,
				timestamp: new Date().toISOString(),
				path: req.path,
				method: req.method
			};

			if (classified.details) {
				response.details = classified.details;
			}

			res.status(classified.statusCode).json(response);
		});
	};
};

module.exports = catchAsync;
