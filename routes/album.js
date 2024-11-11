// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/album.js");
const validation = require("../middlewares/validation.js");
const fileUpload = require("../middlewares/fileUpload.js");
const multer = require('multer');
const auth = require("../middlewares/auth.js");

router.get(
  "/", 
  controller.get
)
// router.get("/getOne", controller.getOne)

router.post(
  "/", 
  auth.accessResource,
  multer().none(), 
  controller.post
)

router.put(
  "/", 
  auth.accessResource,
  multer().none(), 
  controller.put
)

router.delete(
  "/:OID", 
  auth.accessResource,
  controller.delete
)

router.post(
  "/manageAlbumPhotos", 
  auth.accessResource,
  fileUpload.fields([
    // { name: "featuredPhoto", maxCount: 1 },
    { name: "default", maxCount: 99 }
  ]), 
  controller.manageAlbumPhotos
)

module.exports = router;  
