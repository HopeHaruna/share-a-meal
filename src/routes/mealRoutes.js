const express = require("express");

const {
	createMeal,
	getAllMeals,
	getMealsByStatus,
	getMealById,
	getMyMeals,
	updateMeal,
	deleteMeal,
} = require("../controllers/mealController");

const {
	authenticate,
	requireRole,
	requireVerified,
} = require("../middleware/auth");
const { validateIdParam } = require("../middleware/validate");

const router = express.Router();

router.get("/", getAllMeals);

router.get("/status/:status", getMealsByStatus);

router.get("/:mealId", validateIdParam("mealId"), getMealById);

router.post("/", authenticate, requireRole("sme"), requireVerified, createMeal);

router.get("/my/list", authenticate, requireRole("sme"), getMyMeals);

router.patch(
	"/:mealId",
	validateIdParam("mealId"),
	authenticate,
	requireRole("sme"),
	updateMeal,
);

router.delete(
	"/:mealId",
	validateIdParam("mealId"),
	authenticate,
	requireRole("sme"),
	deleteMeal,
);

module.exports = router;
