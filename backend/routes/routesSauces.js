const express = require("express");
const router = express.Router();
const controlSauces = require("../controllers/controlSauces");
const auth = require("../middlewares/auth");
const multer = require("../middlewares/multer-config");

router.post("/", auth, multer, controlSauces.createSauce);
router.post("/:id/like", auth, controlSauces.likeSauce);
router.put("/:id", auth, multer, controlSauces.modifySauce);
router.delete("/:id", auth, controlSauces.deleteSauce);
router.get("/:id", auth, controlSauces.getOneSauce);
router.get("/", auth, controlSauces.getAllSauce);

module.exports = router;
