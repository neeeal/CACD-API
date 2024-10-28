// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/church.js");
const fileUpload = require("../middlewares/fileUpload.js");

router.get("/", controller.get)
router.get("/getOne", controller.getOne)
router.post("/", fileUpload.single("churchPhoto"), controller.post)
router.put("/", fileUpload.single("churchPhoto"), controller.put)
router.delete("/:OID", controller.delete)

module.exports = router;  
