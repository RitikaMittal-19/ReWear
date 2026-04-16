const router = require("express").Router();
const { body } = require("express-validator");
const ctrl = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");

router.post("/register",
  [body("firstName").trim().notEmpty(), body("lastName").trim().notEmpty(),
   body("email").isEmail().normalizeEmail(), body("password").isLength({ min: 6 })],
  validate, ctrl.register);

router.post("/login",
  [body("email").isEmail().normalizeEmail(), body("password").notEmpty()],
  validate, ctrl.login);

router.get("/me", authenticate, ctrl.getMe);
module.exports = router;
