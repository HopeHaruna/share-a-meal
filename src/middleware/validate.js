const { AppError } = require("./errorHandler");

const validateIdParam = (paramName) => (req, res, next) => {
	const raw = req.params?.[paramName];
	const id = Number(raw);

	if (!Number.isInteger(id) || id <= 0) {
		return next(
			new AppError(
				`Invalid ${paramName}. Must be a positive integer.`,
				400,
				"INVALID_PARAM",
				{ param: paramName, value: raw },
			),
		);
	}

	return next();
};

module.exports = { validateIdParam };
