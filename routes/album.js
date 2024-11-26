// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/album.js");
const validation = require("../middlewares/validation.js");
const fileUpload = require("../middlewares/fileUpload.js");
const company = require("../middlewares/company.js");
const multer = require('multer');
const auth = require("../middlewares/auth.js");
const authCodes = require("../config/authCodes.js");

// TODO: separate GET routes for single, all-in-company, and all resources for all routes
// TODO: change update routes to use paramd OID

router.get(
  "/byCompany/:companyOid", 
  controller.getByCompany
)

router.get(
  "/:albumOid/byCompany/:companyOid",
  controller.getOne
)

router.get(
  "/", 
  auth.authorizeAccess(authCodes.album.read),
  controller.get
)

router.post(
  "/", 
  auth.authorizeAccess(authCodes.album.create),
  multer().none(), 
  company.assignCompany,
  controller.post
)

router.put(
  "/", 
  auth.authorizeAccess(authCodes.album.update),
  multer().none(), 
  company.assignCompany,
  controller.put
)

router.delete(
  "/:OID", 
  auth.authorizeAccess(authCodes.album.delete),
  company.assignCompany,
  controller.delete
)

router.post(
  "/manageAlbumPhotos", 
  auth.authorizeAccess(authCodes.album.manageAlbumPhotos),
  fileUpload.fields([
    // { name: "featuredPhoto", maxCount: 1 },
    { name: "default", maxCount: 99 }
  ]), 
  company.assignCompany,
  controller.manageAlbumPhotos
)

module.exports = router;  
