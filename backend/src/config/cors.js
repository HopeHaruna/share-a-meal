const cors = require("cors");

const allowedOrigins = [
	"http://localhost:3000",
	"http://localhost:5173",
	"https://your-production-frontend.com",
];

module.exports = cors({
	origin: allowedOrigins,
	credentials: true,
});
