const express = require("express");

const { register, login } = require("../controllers/authController");
const { loginLimiter } = require("../middleware/requestGuards");
const router = express.Router();

router.post("/register", register);

router.post("/login", login);

router.post("/login", loginLimiter, login);
module.exports = router;
