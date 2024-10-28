// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/church.js");

router.get("/", controller.get)
router.get("/getOne", controller.getOne)
router.post("/", controller.post)
router.put("/", controller.put)
router.delete("/:oid", controller.delete)

module.exports = router;  
