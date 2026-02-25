const express = require("express");
require("dotenv").config();
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

// Initialize Express app
const app = express();

// CORS must come first
const corsMiddleware = require("./config/cors")();
app.use(corsMiddleware);

// Built-in middleware
app.use(express.json());

// Import routes and middleware AFTER app is defined
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const mealRoutes = require("./routes/mealRoutes");
const claimRoutes = require("./routes/claimRoutes");
const sponsorshipRoutes = require("./routes/sponsorshipRoutes");
const aiRoutes = require("./routes/aiRoutes");
const metricsRoutes = require("./routes/metricsRoutes");
const { runAllGuards } = require("./jobs/mealGuards");
const {
	errorHandler,
	errorConverter,
	notFound,
} = require("./middleware/errorHandler");
const { rateLimiter, requestTimeout } = require("./middleware/requestGuards");
const { dbHealth } = require("./middleware/dbHealth");

// Skip rateLimiter and timeout for preflight OPTIONS requests
app.use((req, res, next) => {
	if (req.method === "OPTIONS") return next(); // preflight should always pass
	rateLimiter(req, res, next);
});

app.use((req, res, next) => {
	if (req.method === "OPTIONS") return next(); // preflight should always pass
	requestTimeout(req, res, next);
});

// Swagger API docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Health check endpoint
app.get("/", (req, res) => {
	res.json({ message: "Share-a-Meal is running." });
});

// Database health middleware
app.use(dbHealth);

// Application routes
app.use("/auth", authRoutes);
app.use("/meals", mealRoutes);
app.use("/claims", claimRoutes);
app.use("/sponsorships", sponsorshipRoutes);
app.use("/admin", adminRoutes);
app.use("/ai", aiRoutes);
app.use("/metrics", metricsRoutes);

// Error handling middleware
app.use(notFound);
app.use(errorConverter);
app.use(errorHandler);

// Scheduled jobs (if not in test mode)
if (process.env.NODE_ENV !== "test") {
	setTimeout(runAllGuards, 5000);
	setInterval(runAllGuards, 5 * 60 * 1000);
	const PORT = process.env.PORT || 3000;
	app.listen(PORT, () => {
		console.log(`Server running on http://localhost:${PORT}`);
	});
}

module.exports = app;
