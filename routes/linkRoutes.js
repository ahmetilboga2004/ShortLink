// * THIRD-PARTY
const passport = require("passport");
const express = require("express");
// * MY-MODULES
const linkController = require("../controllers/linkController");

const router = express.Router();

router.delete("/:linkId", linkController.deleteLink);
router.get("/:shortLink", linkController.getLink);
router.post("/short-link", linkController.shortLink);

module.exports = router;
