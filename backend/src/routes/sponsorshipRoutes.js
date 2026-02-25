const express = require("express");
const router = express.Router();

const {
	createSponsorship,
	getMySponsorships,
	getMealSponsors,
	getNGOSponsors,
	getSponsorImpact,
} = require("../controllers/sponsorshipController");

const {
	authenticate,
	requireRole,
	requireVerified,
} = require("../middleware/auth");
const { validateIdParam } = require("../middleware/validate");

router.post("/", authenticate, requireRole("sponsor"), createSponsorship);

router.get("/my", authenticate, requireRole("sponsor"), getMySponsorships);

router.get("/impact", authenticate, requireRole("sponsor"), getSponsorImpact);

router.get(
	"/sponsors/:sponsorId",
	validateIdParam("sponsorId"),
	getSponsorImpact,
);

router.get("/meals/:mealId", validateIdParam("mealId"), getMealSponsors);

router.get("/ngos/:ngoId", validateIdParam("ngoId"), getNGOSponsors);

module.exports = router;
