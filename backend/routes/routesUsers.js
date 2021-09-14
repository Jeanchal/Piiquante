const express = require("express");
const router = express.Router();
const controlUsers = require("../controllers/controlUsers.js");

router.post("/signup", controlUsers.signup);
router.post("/login", controlUsers.login);

module.exports = router;
