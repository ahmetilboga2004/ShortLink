// * THIRD-PARTY
const passport = require("passport");
const express = require("express");
const connectEnsureLogin = require("connect-ensure-login");
// * MY-MODULES
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");
const upload = require("../config/multerConfig");

const router = express.Router();

router.post("/register", authController.registerUser);
router.post("/contact-form", authController.contactform);
// Kullanıcı girişi işlemi
router.post("/login", authController.loginUser);

router.get(
  "/profile",
  connectEnsureLogin.ensureLoggedIn("/login"),
  authController.profileUser
);
router.get("/verify", authController.verify);

router.get(
  "/logout",
  connectEnsureLogin.ensureLoggedIn("/login"),
  authController.logout
);
// Reset password
router.post(
  "/reset",
  connectEnsureLogin.ensureLoggedIn("/login"),
  authController.resetPassword
);

router.post(
  "/forgot",
  connectEnsureLogin.ensureLoggedOut("/dashboard"),
  authController.forgotPassword
);

router.get(
  "/reset-forgot-password",
  connectEnsureLogin.ensureLoggedOut("/dashboard"),
  authController.resetForgot
);

router.post(
  "/reset-forgot-password",
  connectEnsureLogin.ensureLoggedOut("/dashboard"),
  authController.resetForgotPassword
);

module.exports = router;
