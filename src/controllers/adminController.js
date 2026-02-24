const pool = require("../config/db");
const { AppError } = require("../middleware/errorHandler");

const getPendingUsers = async (req, res, next) => {
	try {

		const [users] = await pool.query(
			"SELECT id, name, email, role, organization_name, address, phone, created_at FROM users WHERE is_verified = FALSE AND role != 'admin' ORDER BY created_at DESC",
		);

		res.json({
			message: "Pending users retrieved",
			count: users.length,
			users,
		});
	} catch (error) {
		
		next(error);
	}
};

const getAllUsers = async (req, res, next) => {
	try {

		const [users] = await pool.query(
			"SELECT id, name, email, role, organization_name, address, phone, is_verified, created_at FROM users ORDER BY is_verified ASC, created_at DESC",
		);

		res.json({
			message: "All users retrieved",
			count: users.length,
			users,
		});
	} catch (error) {
		
		next(error);
	}
};

const verifyUser = async (req, res, next) => {
	try {
		
		const { userId } = req.params;

		const [users] = await pool.query(
			"SELECT id, name, email, role, is_verified FROM users WHERE id = ?",
			[userId],
		);

		if (users.length === 0) {
			throw new AppError("User not found", 404, "NOT_FOUND", {
				resource: "user",
				id: userId,
			});
		}

		const user = users[0];

		if (user.is_verified) {
			throw new AppError("User is already verified", 400, "INVALID_STATE");
		}

		if (user.role === "admin") {
			throw new AppError(
				"Admins do not require verification",
				400,
				"INVALID_STATE",
			);
		}

		await pool.query("UPDATE users SET is_verified = TRUE WHERE id = ?", [
			userId,
		]);

		res.json({
			message: "User verified successfully",
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		});
	} catch (error) {
		
		next(error);
	}
};

const revokeVerification = async (req, res, next) => {
	try {
		
		const { userId } = req.params;

		const [users] = await pool.query(
			"SELECT id, name, email, role, is_verified FROM users WHERE id = ?",
			[userId],
		);

		if (users.length === 0) {
			throw new AppError("User not found", 404, "NOT_FOUND", {
				resource: "user",
				id: userId,
			});
		}

		const user = users[0];

		if (!user.is_verified) {
			throw new AppError("User is not verified", 400, "INVALID_STATE");
		}

		if (user.role === "admin") {
			throw new AppError(
				"Cannot revoke admin verification",
				400,
				"INVALID_STATE",
			);
		}

		await pool.query("UPDATE users SET is_verified = FALSE WHERE id = ?", [
			userId,
		]);

		res.json({
			message: "Verification revoked successfully",
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
			},
		});
	} catch (error) {
		
		next(error);
	}
};

module.exports = {
	getPendingUsers,
	getAllUsers,
	verifyUser,
	revokeVerification,
};
