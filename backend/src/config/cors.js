const cors = require("cors");

const allowedOrigins = [
	"http://localhost:3000",
	"http://localhost:5173",
	process.env.FRONTEND_URL,
	,
].filter(Boolean);

module.exports = () =>
	cors({
		origin: function (origin, callback) {
			if (!origin) return callback(null, true); // allow Postman / curl
			if (allowedOrigins.includes(origin)) {
				callback(null, origin); // return the origin string explicitly
			} else {
				callback(new Error("Not allowed by CORS"));
			}
		},
		credentials: true,
		methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
		allowedHeaders: "Content-Type, Authorization",
	});
