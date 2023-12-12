// * THIRD-PARTY
const express = require("express");
const connectEnsureLogin = require("connect-ensure-login");
// * MY-MODULES
const pageController = require("../controllers/pageController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", pageController.getIndexPage);
router.get("/about", pageController.getAboutPage);
router.get("/contact", pageController.getContactPage);

router.get(
  "/dashboard",
  connectEnsureLogin.ensureLoggedIn("/login"),
  authMiddleware.afterLoginCheckVerify,
  pageController.getDashboardPage
);
router.get(
  "/login",
  connectEnsureLogin.ensureLoggedOut("/dashboard"),
  pageController.getLoginPage
);
router.get(
  "/register",
  connectEnsureLogin.ensureLoggedOut("/dashboard"),
  pageController.getRegisterPage
);

router.get(
  "/reset",
  connectEnsureLogin.ensureLoggedIn("/login"),
  authMiddleware.afterLoginCheckVerify,
  pageController.getResetPage
);
router.get(
  "/forgot",
  connectEnsureLogin.ensureLoggedOut("/dashboard"),
  pageController.getForgotPage
);

module.exports = router;
