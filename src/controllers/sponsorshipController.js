const pool = require("../config/db");
const { AppError } = require("../middleware/errorHandler");

const createSponsorship = async (req, res, next) => {
	try {
		
		const sponsor_id = req.user.id;

		const { meal_id, ngo_id, amount, note } = req.body;

		if (!meal_id && !ngo_id) {
			throw new AppError(
				"Either meal_id or ngo_id must be provided",
				400,
				"VALIDATION_ERROR",
				{ fields: ["meal_id", "ngo_id"] },
			);
		}

		if (!amount || amount <= 0) {
			throw new AppError(
				"Amount must be a positive number",
				400,
				"INVALID_FORMAT",
			);
		}

		if (meal_id) {
			const [meals] = await pool.query(
				"SELECT id, restaurant_id FROM meals WHERE id = ?",
				[meal_id],
			);

			if (meals.length === 0) {
				throw new AppError("Meal not found", 404, "NOT_FOUND", {
					resource: "meal",
					id: meal_id,
				});
			}

			if (meals[0].restaurant_id === sponsor_id) {
				throw new AppError(
					"Cannot sponsor your own meal",
					400,
					"INVALID_STATE",
				);
			}
		}

		if (ngo_id) {
			const [ngos] = await pool.query(
				"SELECT id, role FROM users WHERE id = ? AND role = 'ngo'",
				[ngo_id],
			);

			if (ngos.length === 0) {
				throw new AppError("NGO not found", 404, "NOT_FOUND", {
					resource: "ngo",
					id: ngo_id,
				});
			}
		}

		const [result] = await pool.query(
			"INSERT INTO sponsorships (sponsor_id, meal_id, ngo_id, amount, note) VALUES (?, ?, ?, ?, ?)",
			[sponsor_id, meal_id || null, ngo_id || null, amount, note || null],
		);

		res.status(201).json({
			message: "Sponsorship created successfully",
			sponsorshipId: result.insertId,
			sponsor_id,
			meal_id: meal_id || null,
			ngo_id: ngo_id || null,
			amount,
		});
	} catch (error) {
		next(error);
	}
};

const getMySponsorships = async (req, res, next) => {
	try {
		
		const sponsor_id = req.user.id;

		const [sponsorships] = await pool.query(
			`SELECT 
        s.id,
        s.sponsor_id,
        s.meal_id,
        s.ngo_id,
        s.amount,
        s.note,
        s.created_at,
        m.title as meal_title,
        m.status as meal_status,
        u.organization_name as ngo_name,
        u.id as ngo_id_alt
      FROM sponsorships s
      LEFT JOIN meals m ON s.meal_id = m.id
      LEFT JOIN users u ON s.ngo_id = u.id
      WHERE s.sponsor_id = ?
      ORDER BY s.created_at DESC`,
			[sponsor_id],
		);

		res.json({
			message: "Your sponsorships retrieved",
			sponsorships,
			total: sponsorships.length,
		});
	} catch (error) {
		next(error);
	}
};

const getMealSponsors = async (req, res, next) => {
	try {
		
		const { mealId } = req.params;

		if (!Number.isInteger(Number(mealId)) || mealId <= 0) {
			throw new AppError(
				"Invalid mealId. Must be a positive integer.",
				400,
				"INVALID_PARAM",
			);
		}

		const [meals] = await pool.query(
			"SELECT id, title, status FROM meals WHERE id = ?",
			[mealId],
		);

		if (meals.length === 0) {
			throw new AppError("Meal not found", 404, "NOT_FOUND", {
				resource: "meal",
				id: mealId,
			});
		}

		const [sponsorships] = await pool.query(
			`SELECT 
        s.id,
        s.sponsor_id,
        s.amount,
        s.note,
        s.created_at,
        u.name as sponsor_name,
        u.organization_name as sponsor_org
      FROM sponsorships s
      JOIN users u ON s.sponsor_id = u.id
      WHERE s.meal_id = ?
      ORDER BY s.created_at DESC`,
			[mealId],
		);

		const totalSponsored = sponsorships.reduce(
			(sum, s) => sum + parseFloat(s.amount),
			0,
		);

		res.json({
			message: "Meal sponsors retrieved",
			meal: meals[0],
			sponsors: sponsorships,
			totalSponsored,
			sponsorCount: sponsorships.length,
		});
	} catch (error) {
		next(error);
	}
};

const getNGOSponsors = async (req, res, next) => {
	try {
		
		const { ngoId } = req.params;

		if (!Number.isInteger(Number(ngoId)) || ngoId <= 0) {
			throw new AppError(
				"Invalid ngoId. Must be a positive integer.",
				400,
				"INVALID_PARAM",
			);
		}

		const [ngos] = await pool.query(
			"SELECT id, organization_name, role FROM users WHERE id = ? AND role = 'ngo'",
			[ngoId],
		);

		if (ngos.length === 0) {
			throw new AppError("NGO not found", 404, "NOT_FOUND", {
				resource: "ngo",
				id: ngoId,
			});
		}

		const [sponsorships] = await pool.query(
			`SELECT 
        s.id,
        s.sponsor_id,
        s.amount,
        s.note,
        s.created_at,
        u.name as sponsor_name,
        u.organization_name as sponsor_org
      FROM sponsorships s
      JOIN users u ON s.sponsor_id = u.id
      WHERE s.ngo_id = ?
      ORDER BY s.created_at DESC`,
			[ngoId],
		);

		const totalSponsored = sponsorships.reduce(
			(sum, s) => sum + parseFloat(s.amount),
			0,
		);

		res.json({
			message: "NGO sponsors retrieved",
			ngo: ngos[0],
			sponsors: sponsorships,
			totalSponsored,
			sponsorCount: sponsorships.length,
		});
	} catch (error) {
		next(error);
	}
};

const getSponsorImpact = async (req, res, next) => {
	try {
		
		const sponsorIdParam = req.params.sponsorId;
		const sponsor_id = sponsorIdParam ? Number(sponsorIdParam) : req.user.id;

		if (!Number.isInteger(sponsor_id) || sponsor_id <= 0) {
			throw new AppError(
				"Invalid sponsorId. Must be a positive integer.",
				400,
				"INVALID_PARAM",
			);
		}

		const [sponsors] = await pool.query(
			"SELECT id, name, organization_name, role FROM users WHERE id = ?",
			[sponsor_id],
		);

		if (sponsors.length === 0) {
			throw new AppError("Sponsor not found", 404, "NOT_FOUND", {
				resource: "sponsor",
				id: sponsor_id,
			});
		}

		const [amountResult] = await pool.query(
			"SELECT SUM(amount) as total_amount FROM sponsorships WHERE sponsor_id = ?",
			[sponsor_id],
		);

		const totalAmount = amountResult[0]?.total_amount || 0;

		const [countResult] = await pool.query(
			"SELECT COUNT(*) as sponsorship_count FROM sponsorships WHERE sponsor_id = ?",
			[sponsor_id],
		);

		const sponsorshipCount = countResult[0]?.sponsorship_count || 0;

		const [mealsResult] = await pool.query(
			"SELECT COUNT(DISTINCT meal_id) as meals_sponsored FROM sponsorships WHERE sponsor_id = ? AND meal_id IS NOT NULL",
			[sponsor_id],
		);

		const mealCount = mealsResult[0]?.meals_sponsored || 0;

		const [ngosResult] = await pool.query(
			"SELECT COUNT(DISTINCT ngo_id) as ngos_supported FROM sponsorships WHERE sponsor_id = ? AND ngo_id IS NOT NULL",
			[sponsor_id],
		);

		const ngoCount = ngosResult[0]?.ngos_supported || 0;

		res.json({
			message: "Sponsor impact metrics retrieved",
			sponsor: sponsors[0],
			metrics: {
				totalAmountSponsored: totalAmount,
				totalSponsorships: sponsorshipCount,
				mealsSponored: mealCount,
				ngosSupported: ngoCount,
			},
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	createSponsorship,
	getMySponsorships,
	getMealSponsors,
	getNGOSponsors,
	getSponsorImpact,
};
