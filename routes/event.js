// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/event.js");
const validation = require("../middlewares/validation.js");
const fileUpload = require("../middlewares/fileUpload.js");

router.get("/", controller.get)
router.get("/getOne", controller.getOne)
router.post("/",  fileUpload.single("featuredPhoto"), controller.post)
router.put("/",  fileUpload.single("featuredPhoto"), controller.put)
router.delete("/:OID", controller.delete)

module.exports = router;  
