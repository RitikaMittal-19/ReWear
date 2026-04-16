const router = require("express").Router();
const { body } = require("express-validator");
const ctrl = require("../controllers/order.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");

router.use(authenticate);
router.get("/", ctrl.getMine);
router.post("/", [body("itemId").isInt().withMessage("Valid itemId required")], validate, ctrl.request);
router.patch("/:id/accept", ctrl.accept);
router.patch("/:id/reject", ctrl.reject);
router.patch("/:id/complete", ctrl.complete);
module.exports = router;
