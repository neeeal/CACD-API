// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.js");
const validation = require("../middlewares/validation.js");
const fileUpload = require("../middlewares/fileUpload.js");
const auth = require("../middlewares/auth.js");
const company = require("../middlewares/company.js");
const authCodes = require("../config/authCodes.js");

router.get(
  "/byCompany", 
  auth.authorizeAccess(authCodes.user.readByCompany),
  controller.getByCompany
)

router.get(
  "/:user",
  auth.authorizeAccess(authCodes.user.readOne),
  controller.getOne
)

router.get(
  "/", 
  auth.authorizeAccess(authCodes.user.read),
  controller.get
)

// router.get("/getOne", controller.getOne)
router.post(
  "/", 
  fileUpload.single("userPhoto"), 
  validation.userRegisterAndUpdate, 
  validation.passwordConfirmation, 
  company.assignCompany,
  controller.post
)

router.put(
  "/", 
  auth.authorizeAccess(authCodes.user.update),
  fileUpload.single("userPhoto"), 
  validation.userRegisterAndUpdate, 
  validation.passwordConfirmation, 
  company.assignCompany,
  controller.put
)

router.delete(
  "/:OID", 
  auth.authorizeAccess(authCodes.user.delete),
  company.assignCompany,
  controller.delete
)

module.exports = router;  
