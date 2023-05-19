const express = require("express");
const router = express.Router();
const authController = require("../controllers/auth");

router.post("/generate-otp", authController.passwordLessLogin);
router.post("/verify-otp", authController.login);

module.exports = router;
