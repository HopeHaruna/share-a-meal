const express = require("express");

const {
	getMealForAI,
	getMealsForAI,
	setMealExpiry,
	updateMealExpiry,
	updateMealFoodStatus,
} = require("../controllers/aiController");

const { authenticateService } = require("../middleware/serviceAuth");
const { validateIdParam } = require("../middleware/validate");

const router = express.Router();

router.get(
	"/meal/:mealId",
	validateIdParam("mealId"),
	authenticateService,
	getMealForAI,
);

router.get("/meals", authenticateService, getMealsForAI);

router.post(
	"/meal/:mealId/expiry",
	validateIdParam("mealId"),
	authenticateService,
	setMealExpiry,
);

router.patch(
	"/meal/:mealId/expiry",
	validateIdParam("mealId"),
	authenticateService,
	updateMealExpiry,
);

router.patch(
	"/meal/:mealId/food-status",
	validateIdParam("mealId"),
	authenticateService,
	updateMealFoodStatus,
);

module.exports = router;
