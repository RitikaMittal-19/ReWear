const router = require("express").Router();
const ctrl = require("../controllers/wishlist.controller");
const { authenticate } = require("../middleware/auth.middleware");
router.use(authenticate);
router.get("/", ctrl.get);
router.post("/:itemId", ctrl.add);
router.delete("/:itemId", ctrl.remove);
module.exports = router;
