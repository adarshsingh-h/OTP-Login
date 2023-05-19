const express = require('express');
const router = express.Router();
const authController = require("../controllers/auth");


router.post("/password-less-login", authController.passwordLessLogin);
router.post("/login", authController.login);

module.exports = router;