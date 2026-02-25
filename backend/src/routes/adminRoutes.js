const express = require("express");

const {
	getPendingUsers,
	getAllUsers,
	verifyUser,
	revokeVerification,
} = require("../controllers/adminController");

const { adminRegister, adminLogin } = require("../controllers/authController");

const { authenticate, requireRole } = require("../middleware/auth");
const { validateIdParam } = require("../middleware/validate");

const router = express.Router();

router.post("/auth/register", adminRegister);

router.post("/auth/login", adminLogin);

router.get(
	"/users/pending",
	authenticate,
	requireRole("admin"),
	getPendingUsers,
);

router.get("/users", authenticate, requireRole("admin"), getAllUsers);

router.patch(
	"/verify/:userId",
	validateIdParam("userId"),
	authenticate,
	requireRole("admin"),
	verifyUser,
);

router.patch(
	"/revoke/:userId",
	validateIdParam("userId"),
	authenticate,
	requireRole("admin"),
	revokeVerification,
);

module.exports = router;
