// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/event.js");
const validation = require("../middlewares/validation.js");
const fileUpload = require("../middlewares/fileUpload.js");

router.get("/", controller.get)
// router.get("/getOne", controller.getOne)
router.post("/",  
  fileUpload.fields([
    { name: "featuredPhoto", maxCount: 1 },
    { name: "default", maxCount: 99 }
  ]), 
  controller.post)
router.put("/",  
  fileUpload.fields([
    { name: "featuredPhoto", maxCount: 1 },
    { name: "default", maxCount: 99 }
  ]), 
  controller.put)
router.delete("/:OID", controller.delete)

module.exports = router;  
