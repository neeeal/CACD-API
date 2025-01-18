// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/contact.js");
const validation = require("../middlewares/validation.js");
const fileUpload = require("../middlewares/fileUpload.js");
const auth = require("../middlewares/auth.js");
const company = require("../middlewares/company.js");
const authCodes = require("../config/authCodes.js");
const newFileUpload = require("../middlewares/newFileUpload.js");

router.get(
  "/byCompany", 
  auth.authorizeAccess(authCodes.contact.readByCompany),
  controller.getByCompany
)

router.get(
  "/:contact",
  auth.authorizeAccess(authCodes.contact.readOne),
  controller.getOne
)

router.get(
  "/", 
  auth.authorizeAccess(authCodes.contact.read),
  controller.get
)

// router.get("/getOne", controller.getOne)
router.post(
  "/:company", 
  // fileUpload.fields([
  //   { name: "contactPhotos", maxCount: 10 }, // upload up to 10 files
  // ]), 
  newFileUpload,
  company.assignCompany,
  controller.post
)

router.put(
  "/:company", 
  // auth.authorizeAccess(authCodes.contact.update),
  // fileUpload.fields([
  //   { name: "contactPhotos", maxCount: 10 }, // upload up to 10 files
  // ]), 
  newFileUpload,
  company.assignCompany,
  controller.put
)

router.delete(
  "/:OID", 
  auth.authorizeAccess(authCodes.contact.delete),
  company.assignCompany,
  controller.delete
)

module.exports = router;  
