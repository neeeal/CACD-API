// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.js");

router.get("/", controller.get)

module.exports = router;  
