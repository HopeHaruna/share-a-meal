const pool = require("../config/db");

const logMealStatusChange = async (mealId, fromStatus, toStatus, note) => {
	try {
		
		await pool.query(
			"INSERT INTO meal_logs (meal_id, changed_by_id, from_status, to_status, note) VALUES (?, ?, ?, ?, ?)",
			[mealId, null, fromStatus, toStatus, note],
		);
	} catch (error) {
		console.error("Error logging meal status:", error);
	}
};

const autoExpireMeals = async () => {
	try {

		const [mealsToExpire] = await pool.query(
			`SELECT id, status FROM meals 
             WHERE expiry_at IS NOT NULL 
             AND expiry_at < NOW()
             AND status IN ('AVAILABLE', 'CLAIMED')`,
		);

		for (const meal of mealsToExpire) {
			
			await pool.query("UPDATE meals SET status = ? WHERE id = ?", [
				"EXPIRED",
				meal.id,
			]);

			if (meal.status === "CLAIMED") {
				const [claims] = await pool.query(
					"SELECT id FROM claims WHERE meal_id = ? AND status = 'ACTIVE'",
					[meal.id],
				);

				for (const claim of claims) {
					await pool.query("UPDATE claims SET status = ? WHERE id = ?", [
						"CANCELLED",
						claim.id,
					]);
				}

				await logMealStatusChange(
					meal.id,
					"CLAIMED",
					"EXPIRED",
					"Auto-expired: expiry time passed",
				);
			} else {
				
				await logMealStatusChange(
					meal.id,
					"AVAILABLE",
					"EXPIRED",
					"Auto-expired: expiry time passed",
				);
			}
		}

		if (mealsToExpire.length > 0) {
			console.log(`[GUARD] Auto-expired ${mealsToExpire.length} meals`);
		}

		return mealsToExpire.length;
	} catch (error) {
		console.error("[GUARD ERROR] autoExpireMeals failed:", error);
	}
};

const autoCancelExpiredClaims = async () => {
	try {

		const [claimsToCancel] = await pool.query(
			`SELECT c.id, c.meal_id FROM claims c
             JOIN meals m ON c.meal_id = m.id
             WHERE c.status = 'ACTIVE'
             AND c.picked_up_at IS NULL
             AND TIMESTAMPDIFF(MINUTE, c.claimed_at, NOW()) > 30
             AND m.status IN ('CLAIMED', 'PICKUP_READY')`,
		);

		for (const claim of claimsToCancel) {
			
			await pool.query("UPDATE claims SET status = ? WHERE id = ?", [
				"CANCELLED",
				claim.id,
			]);

			await pool.query("UPDATE meals SET status = ? WHERE id = ?", [
				"AVAILABLE",
				claim.meal_id,
			]);

			await logMealStatusChange(
				claim.meal_id,
				"CLAIMED",
				"AVAILABLE",
				"Claim auto-cancelled: 30-min reservation expired",
			);
		}

		if (claimsToCancel.length > 0) {
			console.log(
				`[GUARD] Auto-cancelled ${claimsToCancel.length} expired claims`,
			);
		}

		return claimsToCancel.length;
	} catch (error) {
		console.error("[GUARD ERROR] autoCancelExpiredClaims failed:", error);
	}
};

const autoCancelStalePickupReadyMeals = async () => {
	try {
		
		const [mealsToCancel] = await pool.query(
			`SELECT m.id, m.status FROM meals m
             WHERE m.status = 'PICKUP_READY'
             AND TIMESTAMPDIFF(HOUR, m.updated_at, NOW()) > 2`,
		);

		for (const meal of mealsToCancel) {
			
			await pool.query("UPDATE meals SET status = ? WHERE id = ?", [
				"CANCELLED",
				meal.id,
			]);

			const [claims] = await pool.query(
				"SELECT id FROM claims WHERE meal_id = ? AND status = 'ACTIVE'",
				[meal.id],
			);

			for (const claim of claims) {
				await pool.query("UPDATE claims SET status = ? WHERE id = ?", [
					"CANCELLED",
					claim.id,
				]);
			}

			await logMealStatusChange(
				meal.id,
				"PICKUP_READY",
				"CANCELLED",
				"Auto-cancelled: stale (no pickup for 2 hours)",
			);
		}

		if (mealsToCancel.length > 0) {
			console.log(
				`[GUARD] Auto-cancelled ${mealsToCancel.length} stale PICKUP_READY meals`,
			);
		}

		return mealsToCancel.length;
	} catch (error) {
		console.error(
			"[GUARD ERROR] autoCancelStalePickupReadyMeals failed:",
			error,
		);
	}
};

const runAllGuards = async () => {
	try {
		console.log("[GUARD] Running meal guards...");

		const expiredCount = await autoExpireMeals();
		const cancelledCount = await autoCancelExpiredClaims();
		const staleCount = await autoCancelStalePickupReadyMeals();

		console.log(
			`[GUARD] Complete: ${expiredCount} expired, ${cancelledCount} cancelled, ${staleCount} stale`,
		);

		return {
			expired: expiredCount,
			cancelled: cancelledCount,
			stale: staleCount,
		};
	} catch (error) {
		console.error("[GUARD ERROR] runAllGuards failed:", error);
	}
};

module.exports = {
	autoExpireMeals,
	autoCancelExpiredClaims,
	autoCancelStalePickupReadyMeals,
	runAllGuards,
};
