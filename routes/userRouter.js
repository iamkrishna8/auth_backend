const express = require("express");

const userController = require("../controller/userController");
const AuthController = require("../controller/authController");

const router = express.Router();

router.post("/signup", AuthController.register);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);

router.route("/:id").get(userController.getUser);

module.exports = router;
