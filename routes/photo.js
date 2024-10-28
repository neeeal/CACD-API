// user.js
const express = require("express");
const fileUpload = require("../middlewares/fileUpload.js");
const router = express.Router();
const controller = require("../controllers/photo.js");
const validation = require("../middlewares/validation.js");

router.get("/", controller.get)
router.get("/getOne", controller.getOne)
router.post("/", fileUpload.single("eventImage"), controller.post)
router.put("/", fileUpload.single("eventImage"), controller.put)
router.delete("/:oid", controller.delete)

module.exports = router;  
