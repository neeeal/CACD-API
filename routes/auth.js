// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth.js");
const auth = require("../middlewares/auth.js");
const multer = require('multer');

router.post("/login", multer().none(), controller.login)
router.post("/logout", auth.accessResource, multer().none(), controller.logout)
// router.get("/accessResource", controller.accessResource)

module.exports = router;  
