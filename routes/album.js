// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/album.js");
const validation = require("../middlewares/validation.js");
const fileUpload = require("../middlewares/fileUpload.js");
const multer = require('multer');

router.get("/", controller.get)
// router.get("/getOne", controller.getOne)
router.post("/", multer().none(), controller.post)
router.put("/", multer().none(), controller.put)
router.delete("/:OID", controller.delete)

router.post("/manageAlbumPhotos", 
  fileUpload.fields([
    // { name: "featuredPhoto", maxCount: 1 },
    { name: "default", maxCount: 99 }
  ]), 
  controller.manageAlbumPhotos)

module.exports = router;  
