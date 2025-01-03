// user.js
const express = require("express");
const fileUpload = require("../middlewares/fileUpload.js");
const newFileUpload = require("../middlewares/newFileUpload.js");
const router = express.Router();
const controller = require("../controllers/photo.js");
const validation = require("../middlewares/validation.js");
const auth = require("../middlewares/auth.js");
const company = require("../middlewares/company.js");
const authCodes = require("../config/authCodes.js");

router.get(
  "/byCompany/:company", 
  controller.getByCompany
)

router.get(
  "/:photo/byCompany/:company",
  controller.getOne
)

router.get(
  "/", 
  auth.authorizeAccess(authCodes.photo.read), 
  controller.get
)

// router.get("/getOne", controller.getOne)
router.post(
  "/", 
  auth.authorizeAccess(authCodes.photo.create),
  // fileUpload.single("default"), 
  company.assignCompany,
  newFileUpload,
  controller.post
)

router.put(
  "/", 
  auth.authorizeAccess(authCodes.photo.update),
  // fileUpload.fields([
  //   // { name: "featuredPhoto", maxCount: 1 },
  //   { name: "default", maxCount: 99 }
  // ]), 
  company.assignCompany,
  newFileUpload,
  controller.put
)

router.delete(
  "/:OID", 
  auth.authorizeAccess(authCodes.photo.delete),
  company.assignCompany,
  controller.delete
)

module.exports = router;  
