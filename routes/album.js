// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/album.js");
const validation = require("../middlewares/validation.js");
const fileUpload = require("../middlewares/fileUpload.js");
const company = require("../middlewares/company.js");
const multer = require('multer');
const auth = require("../middlewares/auth.js");

// TODO: separate GET routes for single, all-in-company, and all resources for all routes
// TODO: change update routes to use paramd OID
router.get(
  "/", 
  controller.get
)
// router.get("/getOne", controller.getOne)

router.get(
  "/:OID",
  controller.getOne
)

router.post(
  "/", 
  auth.authorizeAccess("CA1"),
  multer().none(), 
  company.assignCompany,
  controller.post
)

router.put(
  "/", 
  auth.authorizeAccess(),
  multer().none(), 
  company.assignCompany,
  controller.put
)

router.delete(
  "/:OID", 
  auth.authorizeAccess(),
  company.assignCompany,
  controller.delete
)

router.post(
  "/manageAlbumPhotos", 
  auth.authorizeAccess(),
  fileUpload.fields([
    // { name: "featuredPhoto", maxCount: 1 },
    { name: "default", maxCount: 99 }
  ]), 
  company.assignCompany,
  controller.manageAlbumPhotos
)

module.exports = router;  
