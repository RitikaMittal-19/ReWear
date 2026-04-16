const router = require("express").Router();
const { body } = require("express-validator");
const ctrl = require("../controllers/item.controller");
const { authenticate } = require("../middleware/auth.middleware");
const { validate } = require("../middleware/validate.middleware");
const { upload } = require("../config/cloudinary");

router.get("/", ctrl.getItems);
router.get("/mine", authenticate, ctrl.getMine);
router.get("/:id", ctrl.getById);

router.post("/",
  authenticate,
  upload.array("images", 5),
  [
    body("title").trim().notEmpty().withMessage("Title required"),
    body("description").trim().notEmpty().withMessage("Description required"),
    body("category").notEmpty().withMessage("Category required"),
    body("size").notEmpty().withMessage("Size required"),
    body("condition").notEmpty().withMessage("Condition required"),
    body("points").isInt({ min: 10, max: 999 }).withMessage("Points must be 10–999"),
  ],
  validate, ctrl.create);

router.put("/:id", authenticate, ctrl.update);
router.delete("/:id", authenticate, ctrl.remove);

module.exports = router;
