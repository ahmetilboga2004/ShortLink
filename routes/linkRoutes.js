// * THIRD-PARTY
const passport = require("passport");
const express = require("express");
// * MY-MODULES
const linkController = require("../controllers/linkController");

const router = express.Router();

router.get("/get-user-links", linkController.getAllLinks);
router.get("/:shortLink", linkController.getLink);
router.post("/short-link", linkController.shortLink);
router.delete("/:linkId", linkController.deleteLink);

module.exports = router;
