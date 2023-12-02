// * THIRD-PARTY
const express = require("express");
// * MY-MODULES
const userController = require("../controllers/userController");

const router = express.Router();

router.route("/register").post(userController.createUser);

module.exports = router;
