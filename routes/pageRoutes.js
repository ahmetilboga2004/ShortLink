// * THIRD-PARTY
const express = require("express");
// * MY-MODULES
const pageController = require("../controllers/pageController");

const router = express.Router();

router.route("/").get(pageController.getIndexPage);
router.route("/about").get(pageController.getAboutPage);
router.route("/faq").get(pageController.getFaqPage);
router.route("/contact").get(pageController.getContactPage);
router.route("/dashboard").get(pageController.getDashboardPage);
router.route("/adminDashboard").get(pageController.getAdminDashboardPage);
router.route("/login").get(pageController.getLoginPage);
router.route("/register").get(pageController.getRegisterPage);
router.route("/reset").get(pageController.getResetPage);
router.route("/forgot").get(pageController.getForgotPage);

module.exports = router;
