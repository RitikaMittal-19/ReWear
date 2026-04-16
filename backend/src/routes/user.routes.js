const router = require("express").Router();
const ctrl = require("../controllers/user.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { upload } = require("../config/cloudinary");

router.get("/:id", ctrl.getProfile);
router.put("/me", authenticate, upload.single("avatar"), ctrl.updateMe);
router.patch("/me/password", authenticate, ctrl.changePassword);
module.exports = router;
