// * THIRD-PARTY
const passport = require("passport");
const express = require("express");
const connectEnsureLogin = require("connect-ensure-login");
// * MY-MODULES
const authController = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", authController.registerUser);
// Kullanıcı girişi işlemi
router.post(
  "/login",
  passport.authenticate("local", { failureRedirect: "/login" }),
  (req, res) => {
    res.redirect("/dashboard");
  }
);

router.get("/verify", authMiddleware.checkVerifyEmail, authController.verify);

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
