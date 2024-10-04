// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth.js");

router.post("/login", controller.login)
router.put("/logout", controller.logout)
router.get("/refresh", controller.refresh)

module.exports = router;  
