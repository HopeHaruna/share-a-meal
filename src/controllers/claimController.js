const pool = require("../config/db");
const { AppError } = require("../middleware/errorHandler");

const logMealStatusChange = async (
	mealId,
	actorId,
	fromStatus,
	toStatus,
	note,
) => {
	try {
		await pool.query(
			"INSERT INTO meal_logs (meal_id, changed_by_id, from_status, to_status, note) VALUES (?, ?, ?, ?, ?)",
			[mealId, actorId, fromStatus, toStatus, note],
		);
	} catch (error) {
		console.error("Error logging meal status:", error);
	}
};

const claimMeal = async (req, res, next) => {
	try {
		const { mealId } = req.params;

		const ngo_id = req.user.id;

		const [meals] = await pool.query(
			"SELECT id, status, restaurant_id FROM meals WHERE id = ?",
			[mealId],
		);

		if (meals.length === 0) {
			throw new AppError("Meal not found", 404, "NOT_FOUND", {
				resource: "meal",
				id: mealId,
			});
		}

		const meal = meals[0];

		if (meal.restaurant_id === ngo_id) {
			throw new AppError("Cannot claim your own meal", 400, "INVALID_STATE");
		}

		if (meal.status !== "AVAILABLE") {
			throw new AppError(
				`Meal is ${meal.status}. Only AVAILABLE meals can be claimed.`,
				400,
				"INVALID_STATE",
				{ current_status: meal.status },
			);
		}

		const [existingClaims] = await pool.query(
			"SELECT id FROM claims WHERE meal_id = ? AND ngo_id = ? AND status = 'ACTIVE'",
			[mealId, ngo_id],
		);

		if (existingClaims.length > 0) {
			throw new AppError(
				"You already have an active claim on this meal",
				409,
				"CONFLICT",
			);
		}

		const [otherClaims] = await pool.query(
			"SELECT id FROM claims WHERE meal_id = ? AND status = 'ACTIVE'",
			[mealId],
		);

		if (otherClaims.length > 0) {
			throw new AppError(
				"This meal has already been claimed by another NGO",
				409,
				"CONFLICT",
			);
		}

		const [result] = await pool.query(
			"INSERT INTO claims (meal_id, ngo_id, status) VALUES (?, ?, ?)",
			[mealId, ngo_id, "ACTIVE"],
		);

		await pool.query("UPDATE meals SET status = ? WHERE id = ?", [
			"CLAIMED",
			mealId,
		]);

		await logMealStatusChange(
			mealId,
			ngo_id,
			"AVAILABLE",
			"CLAIMED",
			`Claimed by NGO ${ngo_id}`,
		);

		res.status(201).json({
			message: "Meal claimed successfully",
			claimId: result.insertId,
			mealId,
		});
	} catch (error) {
		next(error);
	}
};

const getMyClaims = async (req, res, next) => {
	try {
		const ngo_id = req.user.id;

		const [claims] = await pool.query(
			`SELECT c.*, m.title, m.quantity, m.unit, m.status as meal_status, 
             u.organization_name as restaurant_name
             FROM claims c
             JOIN meals m ON c.meal_id = m.id
             JOIN users u ON m.restaurant_id = u.id
             WHERE c.ngo_id = ?
             ORDER BY c.claimed_at DESC`,
			[ngo_id],
		);

		res.json({
			message: "Your claims retrieved",
			count: claims.length,
			claims,
		});
	} catch (error) {
		next(error);
	}
};

const cancelClaim = async (req, res, next) => {
	try {
		const { claimId } = req.params;

		const ngo_id = req.user.id;

		const [claims] = await pool.query(
			"SELECT id, status, meal_id, ngo_id FROM claims WHERE id = ?",
			[claimId],
		);

		if (claims.length === 0) {
			throw new AppError("Claim not found", 404, "NOT_FOUND", {
				resource: "claim",
				id: claimId,
			});
		}

		const claim = claims[0];

		if (claim.ngo_id !== ngo_id) {
			throw new AppError(
				"You can only cancel your own claims",
				403,
				"FORBIDDEN",
				{ reason: "not_owner" },
			);
		}

		if (claim.status !== "ACTIVE") {
			throw new AppError(
				`Cannot cancel claim with status ${claim.status}`,
				400,
				"INVALID_STATE",
				{ current_status: claim.status },
			);
		}

		const [meals] = await pool.query("SELECT status FROM meals WHERE id = ?", [
			claim.meal_id,
		]);

		await pool.query("UPDATE claims SET status = ? WHERE id = ?", [
			"CANCELLED",
			claimId,
		]);

		await pool.query("UPDATE meals SET status = ? WHERE id = ?", [
			"AVAILABLE",
			claim.meal_id,
		]);

		await logMealStatusChange(
			claim.meal_id,
			ngo_id,
			"CLAIMED",
			"AVAILABLE",
			`Claim cancelled by NGO ${ngo_id}`,
		);

		res.json({
			message: "Claim cancelled successfully",
			claimId,
		});
	} catch (error) {
		next(error);
	}
};

const markPickupReady = async (req, res, next) => {
	try {
		const { mealId } = req.params;

		const restaurant_id = req.user.id;

		const [meals] = await pool.query(
			"SELECT id, status, restaurant_id FROM meals WHERE id = ?",
			[mealId],
		);

		if (meals.length === 0) {
			throw new AppError("Meal not found", 404, "NOT_FOUND", {
				resource: "meal",
				id: mealId,
			});
		}

		const meal = meals[0];

		if (meal.restaurant_id !== restaurant_id) {
			throw new AppError(
				"You can only update your own meals",
				403,
				"FORBIDDEN",
				{ reason: "not_owner" },
			);
		}

		const [claims] = await pool.query(
			"SELECT id FROM claims WHERE meal_id = ? AND status = 'ACTIVE'",
			[mealId],
		);

		if (claims.length === 0) {
			throw new AppError("No active claim on this meal", 400, "INVALID_STATE");
		}

		if (meal.status !== "CLAIMED") {
			throw new AppError(
				`Meal must be CLAIMED to mark as ready. Current status: ${meal.status}`,
				400,
				"INVALID_STATE",
				{ current_status: meal.status },
			);
		}

		await pool.query("UPDATE meals SET status = ? WHERE id = ?", [
			"PICKUP_READY",
			mealId,
		]);

		await logMealStatusChange(
			mealId,
			restaurant_id,
			"CLAIMED",
			"PICKUP_READY",
			`Marked ready for pickup by restaurant ${restaurant_id}`,
		);

		res.json({
			message: "Meal marked as ready for pickup",
			mealId,
		});
	} catch (error) {
		next(error);
	}
};

const confirmPickup = async (req, res, next) => {
	try {
		const { claimId } = req.params;

		const ngo_id = req.user.id;

		const [claims] = await pool.query(
			"SELECT id, meal_id, ngo_id, status FROM claims WHERE id = ?",
			[claimId],
		);

		if (claims.length === 0) {
			throw new AppError("Claim not found", 404, "NOT_FOUND", {
				resource: "claim",
				id: claimId,
			});
		}

		const claim = claims[0];

		if (claim.ngo_id !== ngo_id) {
			throw new AppError(
				"You can only confirm your own claims",
				403,
				"FORBIDDEN",
				{ reason: "not_owner" },
			);
		}

		const [meals] = await pool.query(
			"SELECT status, restaurant_id FROM meals WHERE id = ?",
			[claim.meal_id],
		);

		if (meals.length === 0) {
			throw new AppError("Meal not found", 404, "NOT_FOUND", {
				resource: "meal",
				id: claim.meal_id,
			});
		}

		const meal = meals[0];

		if (meal.status !== "PICKUP_READY") {
			throw new AppError(
				`Meal must be PICKUP_READY. Current status: ${meal.status}`,
				400,
				"INVALID_STATE",
				{ current_status: meal.status },
			);
		}

		await pool.query(
			"UPDATE claims SET status = ?, picked_up_at = NOW() WHERE id = ?",
			["ACTIVE", claimId],
		);

		await pool.query("UPDATE meals SET status = ? WHERE id = ?", [
			"PICKED_UP",
			claim.meal_id,
		]);

		await logMealStatusChange(
			claim.meal_id,
			ngo_id,
			"PICKUP_READY",
			"PICKED_UP",
			`Pickup confirmed by NGO ${ngo_id}`,
		);

		res.json({
			message: "Pickup confirmed successfully",
			claimId,
		});
	} catch (error) {
		next(error);
	}
};

const confirmCompletion = async (req, res, next) => {
	try {
		const { claimId } = req.params;

		const { beneficiaries_count } = req.body;
		const numericCount = Number(beneficiaries_count);
		if (!Number.isInteger(numericCount) || numericCount <= 0) {
			throw new AppError("Invalid beneficiaries count", 400, "INVALID_FORMAT");
		}

		const ngo_id = req.user.id;

		const [claims] = await pool.query(
			"SELECT id, meal_id, ngo_id, status FROM claims WHERE id = ?",
			[claimId],
		);

		if (claims.length === 0) {
			throw new AppError("Claim not found", 404, "NOT_FOUND", {
				resource: "claim",
				id: claimId,
			});
		}

		const claim = claims[0];

		if (claim.ngo_id !== ngo_id) {
			throw new AppError(
				"You can only complete your own claims",
				403,
				"FORBIDDEN",
				{ reason: "not_owner" },
			);
		}

		const [meals] = await pool.query("SELECT status FROM meals WHERE id = ?", [
			claim.meal_id,
		]);

		if (meals.length === 0) {
			throw new AppError("Meal not found", 404, "NOT_FOUND", {
				resource: "meal",
				id: claim.meal_id,
			});
		}

		const meal = meals[0];

		if (meal.status !== "PICKED_UP") {
			throw new AppError(
				`Meal must be PICKED_UP. Current status: ${meal.status}`,
				400,
				"INVALID_STATE",
				{ current_status: meal.status },
			);
		}

		await pool.query(
			"UPDATE claims SET status = ?, completed_at = NOW() WHERE id = ?",
			["COMPLETED", claimId],
		);

		await pool.query("UPDATE meals SET status = ? WHERE id = ?", [
			"COMPLETED",
			claim.meal_id,
		]);

		await logMealStatusChange(
			claim.meal_id,
			ngo_id,
			"PICKED_UP",
			"COMPLETED",
			`Completion confirmed by NGO ${ngo_id}`,
		);

		res.json({
			message: "Meal completion confirmed",
			claimId,
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	claimMeal,
	getMyClaims,
	cancelClaim,
	markPickupReady,
	confirmPickup,
	confirmCompletion,
};
