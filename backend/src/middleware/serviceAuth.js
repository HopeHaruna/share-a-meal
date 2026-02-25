const authenticateService = (req, res, next) => {
	try {

		const token = req.headers.authorization?.split(" ")[1];

		if (!token) {
			return res.status(401).json({ error: "Service token required" });
		}

		if (token !== process.env.SERVICE_TOKEN) {
			return res.status(401).json({ error: "Invalid service token" });
		}

		next();
	} catch (error) {
		return res.status(401).json({ error: "Invalid token" });
	}
};

module.exports = { authenticateService };
