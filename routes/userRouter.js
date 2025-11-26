const express = require("express");

const userController = require("../controller/userController");
const AuthController = require("../controller/authController");

const userAuth = require("../middleware/userAuth");

const router = express.Router();

// Auth Routes
router.post("/signup", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);

router.post("/send-verify-Otp", userAuth, AuthController.sendVerifyOtp);
router.post("/verify-account", userAuth, AuthController.verifyEmail);
router.post("/is-auth", userAuth, AuthController.isAuthenticated);
router.post("/send-reset-otp", AuthController.sendResetOTP);
router.post("/reset-password", AuthController.resetPassword);

// router.route("/:id").get(userController.getUser);

// user Routes
router.get("/data", userAuth, userController.getUserData);

module.exports = router;
