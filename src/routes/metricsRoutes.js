const express = require("express");

const {
	getOverallMetrics,
	getSMEMetrics,
	getNGOMetrics,
	getMealStatusBreakdown,
	getActivityTimeline,
	getAverageCompletionTime,
} = require("../controllers/metricsController");

const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

router.get("/", getOverallMetrics);

router.get("/smes", getSMEMetrics);

router.get("/ngos", getNGOMetrics);

router.get("/status", getMealStatusBreakdown);

router.get("/timeline", getActivityTimeline);

router.get("/completion-time", getAverageCompletionTime);

module.exports = router;
