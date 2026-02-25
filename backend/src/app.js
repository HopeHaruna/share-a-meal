const express = require("express");
require("dotenv").config();
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");
const cors = require("./config/cors");
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
const app = express();
app.use(cors);
app.use(express.json());
app.use(rateLimiter);
app.use(requestTimeout);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.get("/", (req, res) => {
	res.json({ message: "Share-a-Meal is running." });
});
app.use(dbHealth);
app.use("/auth", authRoutes);
app.use("/meals", mealRoutes);
app.use("/claims", claimRoutes);
app.use("/sponsorships", sponsorshipRoutes);
app.use("/admin", adminRoutes);
app.use("/ai", aiRoutes);
app.use("/metrics", metricsRoutes);
app.use(notFound);
app.use(errorConverter);
app.use(errorHandler);
if (process.env.NODE_ENV !== "test") {
	setTimeout(runAllGuards, 5000);
	setInterval(runAllGuards, 5 * 60 * 1000);
	const PORT = process.env.PORT || 3000;
	app.listen(PORT, () => {
		console.log(`Server running on http://localhost:${PORT}`);
	});
}
module.exports = app;
