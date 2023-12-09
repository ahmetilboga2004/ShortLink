// * THIRD-PARTY
const passport = require("passport");
const express = require("express");
// * MY-MODULES
const linkController = require("../controllers/linkController");

const router = express.Router();

router.get("/get-user-links", linkController.getAllLinks);
router.get("/get-all-users", linkController.getAllUsers);
router.get("/get-current-user", linkController.getCurrentUser);
router.get("/:shortLink", linkController.getLink);
router.post("/short-link", linkController.shortLink);
router.delete("/delete-link/:linkId", linkController.deleteLink);
router.delete("/delete-user/:userId", linkController.deleteUser);
router.put("/change-role/:userId", linkController.changeRoleUser);

module.exports = router;
