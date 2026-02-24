const pool = require("../config/db");
const { AppError } = require("../middleware/errorHandler");

const getOverallMetrics = async (req, res, next) => {
	try {
		
		const [mealsData] = await pool.query(
			"SELECT COUNT(*) as total_meals FROM meals",
		);
		const totalMeals = mealsData[0].total_meals;

		const [completedData] = await pool.query(
			"SELECT COUNT(*) as total_completed FROM meals WHERE status = 'COMPLETED'",
		);
		const completedMeals = completedData[0].total_completed;

		const [kgData] = await pool.query(
			"SELECT SUM(quantity) as total_kg FROM meals WHERE unit = 'kg' AND status != 'CANCELLED'",
		);
		const totalKg = kgData[0].total_kg || 0;

		const [ngosData] = await pool.query(
			"SELECT COUNT(DISTINCT ngo_id) as total_ngos FROM claims WHERE status != 'CANCELLED'",
		);
		const totalNGOs = ngosData[0].total_ngos;

		const [restaurantsData] = await pool.query(
			"SELECT COUNT(DISTINCT id) as total_restaurants FROM users WHERE role = 'sme' AND is_verified = TRUE",
		);
		const totalRestaurants = restaurantsData[0].total_restaurants;

		const completionRate =
			totalMeals > 0 ? ((completedMeals / totalMeals) * 100).toFixed(2) : 0;

		const [availableData] = await pool.query(
			"SELECT COUNT(*) as available_meals FROM meals WHERE status = 'AVAILABLE'",
		);
		const availableMeals = availableData[0].available_meals;

		res.json({
			message: "Overall impact metrics retrieved",
			metrics: {
				total_meals_donated: totalMeals,
				total_meals_completed: completedMeals,
				total_kg_saved: parseFloat(totalKg).toFixed(2),
				total_ngos_served: totalNGOs,
				total_restaurants: totalRestaurants,
				completion_rate_percent: parseFloat(completionRate),
				meals_currently_available: availableMeals,
			},
		});
	} catch (error) {
		next(error);
	}
};

const getSMEMetrics = async (req, res, next) => {
	try {
		
		const [metrics] = await pool.query(
			`SELECT 
                u.id,
                u.organization_name,
                COUNT(DISTINCT m.id) as meals_listed,
                SUM(CASE WHEN m.status = 'COMPLETED' THEN 1 ELSE 0 END) as meals_completed,
                SUM(CASE WHEN m.unit = 'kg' AND m.status != 'CANCELLED' THEN m.quantity ELSE 0 END) as kg_donated,
                COUNT(DISTINCT c.ngo_id) as unique_ngos_served,
                u.created_at
            FROM users u
            LEFT JOIN meals m ON u.id = m.restaurant_id
            LEFT JOIN claims c ON m.id = c.meal_id AND c.status != 'CANCELLED'
            WHERE u.role = 'sme' AND u.is_verified = TRUE
            GROUP BY u.id
            ORDER BY meals_completed DESC`,
		);

		res.json({
			message: "SME metrics retrieved",
			count: metrics.length,
			smes: metrics,
		});
	} catch (error) {
		next(error);
	}
};

const getNGOMetrics = async (req, res, next) => {
	try {
		
		const [metrics] = await pool.query(
			`SELECT 
                u.id,
                u.organization_name,
                COUNT(DISTINCT c.meal_id) as meals_claimed,
                SUM(CASE WHEN c.status = 'COMPLETED' THEN 1 ELSE 0 END) as meals_received,
                SUM(CASE WHEN m.unit = 'kg' AND c.status = 'COMPLETED' THEN m.quantity ELSE 0 END) as kg_received,
                COUNT(DISTINCT m.restaurant_id) as restaurants_worked_with,
                u.created_at
            FROM users u
            LEFT JOIN claims c ON u.id = c.ngo_id
            LEFT JOIN meals m ON c.meal_id = m.id
            WHERE u.role = 'ngo' AND u.is_verified = TRUE
            GROUP BY u.id
            ORDER BY meals_received DESC`,
		);

		res.json({
			message: "NGO metrics retrieved",
			count: metrics.length,
			ngos: metrics,
		});
	} catch (error) {
		next(error);
	}
};

const getMealStatusBreakdown = async (req, res, next) => {
	try {
		
		const [statuses] = await pool.query(
			`SELECT status, COUNT(*) as count 
             FROM meals 
             GROUP BY status 
             ORDER BY count DESC`,
		);

		const breakdown = {
			AVAILABLE: 0,
			CLAIMED: 0,
			PICKUP_READY: 0,
			PICKED_UP: 0,
			COMPLETED: 0,
			EXPIRED: 0,
			CANCELLED: 0,
		};

		statuses.forEach((item) => {
			breakdown[item.status] = item.count;
		});

		res.json({
			message: "Meal status breakdown retrieved",
			breakdown,
		});
	} catch (error) {
		next(error);
	}
};

const getActivityTimeline = async (req, res, next) => {
	try {

		const [timeline] = await pool.query(
			`SELECT 
                DATE(c.completed_at) as date,
                COUNT(*) as meals_completed,
                SUM(CASE WHEN m.unit = 'kg' THEN m.quantity ELSE 1 END) as quantity
            FROM claims c
            JOIN meals m ON c.meal_id = m.id
            WHERE c.status = 'COMPLETED' AND c.completed_at IS NOT NULL
            GROUP BY DATE(c.completed_at)
            ORDER BY date DESC
            LIMIT 30`,
		);

		res.json({
			message: "Activity timeline retrieved (last 30 days)",
			count: timeline.length,
			timeline,
		});
	} catch (error) {
		next(error);
	}
};

const getAverageCompletionTime = async (req, res, next) => {
	try {
		
		const [avgTime] = await pool.query(
			`SELECT 
                AVG(TIMESTAMPDIFF(HOUR, m.prepared_at, c.completed_at)) as avg_hours,
                MIN(TIMESTAMPDIFF(HOUR, m.prepared_at, c.completed_at)) as min_hours,
                MAX(TIMESTAMPDIFF(HOUR, m.prepared_at, c.completed_at)) as max_hours
            FROM claims c
            JOIN meals m ON c.meal_id = m.id
            WHERE c.status = 'COMPLETED' AND c.completed_at IS NOT NULL`,
		);

		res.json({
			message: "Average completion time retrieved",
			stats: {
				average_hours: avgTime[0].avg_hours
					? parseFloat(avgTime[0].avg_hours).toFixed(2)
					: 0,
				min_hours: avgTime[0].min_hours || 0,
				max_hours: avgTime[0].max_hours || 0,
			},
		});
	} catch (error) {
		next(error);
	}
};

module.exports = {
	getOverallMetrics,
	getSMEMetrics,
	getNGOMetrics,
	getMealStatusBreakdown,
	getActivityTimeline,
	getAverageCompletionTime,
};
