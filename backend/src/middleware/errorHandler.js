class AppError extends Error {
	constructor(message, statusCode, code, details) {
		super(message);
		this.statusCode = statusCode;
		this.status = "error";
		this.code = code;
		this.details = details;
		this.isOperational = true; 
		Error.captureStackTrace(this, this.constructor);
	}
}

const errorHandler = (err, req, res, next) => {
	
	err.statusCode = err.statusCode || 500;
	err.status = err.status || "error";
	err.code =
		err.code || (err.statusCode === 500 ? "INTERNAL_ERROR" : "UNKNOWN_ERROR");

	console.error("ERROR 💥:", {
		message: err.message,
		statusCode: err.statusCode,
		stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
		timestamp: new Date().toISOString(),
		path: req.path,
		method: req.method,
	});

	const baseResponse = {
		status: err.status,
		message: err.message,
		code: err.code,
		timestamp: new Date().toISOString(),
		path: req.originalUrl,
		method: req.method,
	};

	if (err.details) {
		baseResponse.details = err.details;
	}

	if (process.env.NODE_ENV === "development") {
		return res.status(err.statusCode).json({
			...baseResponse,
			error: err,
			stack: err.stack,
		});
	}

	if (err.isOperational) {
		return res.status(err.statusCode).json({
			...baseResponse,
		});
	}

	console.error("UNEXPECTED ERROR:", err);
	return res.status(500).json({
		status: "error",
		message: "Something went wrong on the server",
		code: "INTERNAL_ERROR",
		timestamp: new Date().toISOString(),
		path: req.originalUrl,
		method: req.method,
	});
};

const handleMySQLError = (err) => {
	
	if (err.code === "ER_DUP_ENTRY") {
		const field = err.message.match(/for key '(.+?)'/)?.[1] || "field";
		const message = `Duplicate value for ${field}. This ${field} already exists.`;
		return new AppError(message, 409, "ER_DUP_ENTRY", { field }); 
	}

	if (err.code === "ER_NO_REFERENCED_ROW_2") {
		return new AppError(
			"Referenced record does not exist",
			400,
			"ER_NO_REFERENCED_ROW_2",
		);
	}

	if (err.code === "ER_DATA_TOO_LONG") {
		return new AppError(
			"Input data exceeds maximum length",
			400,
			"ER_DATA_TOO_LONG",
		);
	}

	if (err.code === "ER_BAD_NULL_ERROR") {
		const field = err.message.match(/Column '(.+?)'/)?.[1] || "field";
		return new AppError(`${field} is required`, 400, "ER_BAD_NULL_ERROR", {
			field,
		});
	}

	return new AppError("Database operation failed", 500, err.code || "DB_ERROR");
};

const handleJWTError = () => {
	return new AppError(
		"Invalid authentication token. Please log in again.",
		401,
		"JWT_INVALID",
	);
};

const handleJWTExpiredError = () => {
	return new AppError(
		"Your session has expired. Please log in again.",
		401,
		"JWT_EXPIRED",
	);
};

const handleSystemError = (err) => {
	const codeMap = {
		ECONNREFUSED: { statusCode: 503, message: "Service unavailable" },
		ECONNRESET: { statusCode: 502, message: "Bad gateway" },
		EPIPE: { statusCode: 502, message: "Bad gateway" },
		ETIMEDOUT: { statusCode: 504, message: "Gateway timeout" },
		ESOCKETTIMEDOUT: { statusCode: 504, message: "Gateway timeout" },
		ENOTFOUND: { statusCode: 502, message: "Bad gateway" },
		EAI_AGAIN: { statusCode: 502, message: "Bad gateway" },
	};

	const mapped = codeMap[err.code];
	if (!mapped) {
		return null;
	}

	return new AppError(mapped.message, mapped.statusCode, err.code);
};

const errorConverter = (err, req, res, next) => {
	let error = err;

	if (!(error instanceof AppError)) {
		
		if (error.code?.startsWith("ER_")) {
			error = handleMySQLError(error);
		}
		
		else if (error.type === "entity.parse.failed") {
			error = new AppError("Invalid JSON payload", 400, "INVALID_JSON");
		}
		
		else if (error.name === "JsonWebTokenError") {
			error = handleJWTError();
		} else if (error.name === "TokenExpiredError") {
			error = handleJWTExpiredError();
		}
		
		else if (error.code) {
			const systemError = handleSystemError(error);
			if (systemError) {
				error = systemError;
			}
		}
		
		else if (error.name === "ValidationError") {
			error = new AppError(
				error.message,
				400,
				"VALIDATION_ERROR",
				error.errors || error.details,
			);
		}
		
		else {
			error = new AppError(
				error.message || "Internal server error",
				500,
				error.code || error.name || "INTERNAL_ERROR",
				error.details,
			);
		}
	}

	next(error);
};

const notFound = (req, res, next) => {
	const error = new AppError(
		`Route ${req.originalUrl} not found on this server`,
		404,
	);
	next(error);
};

module.exports = {
	AppError,
	errorHandler,
	errorConverter,
	notFound,
};
