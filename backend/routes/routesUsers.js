const express = require("express");
const router = express.Router();
const controlUsers = require("../controllers/controlUsers.js");

router.post("/signup", controlUsers.signup);
router.post("/login", controlUsers.login);
// router.put("/:id", controlUsers.modifyUser);
// router.delete("/:id", controlUsers.deleteUser);
// router.get("/:id", controlUsers.getOneUser);
// router.get("/", controlUsers.getAllUsers);

module.exports = router;
