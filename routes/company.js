// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/company.js");
const validation = require("../middlewares/validation.js");
const fileUpload = require("../middlewares/fileUpload.js");
const auth = require("../middlewares/auth.js");
const authCodes = require("../config/authCodes.js");

router.get(
  "/", 
  auth.authorizeAccess(authCodes.company.read),
  auth.authorizeSuperAdmin,
  controller.get
)

router.get(
  "/:companyOid",
  controller.getOne
)

// router.get("/getOne", controller.getOne)
router.post(
  "/", 
  auth.authorizeAccess(authCodes.company.create),
  auth.authorizeSuperAdmin,
  fileUpload.single("companyPhoto"), 
  controller.post
)

router.put(
  "/", 
  auth.authorizeAccess(authCodes.company.update),
  auth.authorizeSuperAdmin,
  fileUpload.single("companyPhoto"), 
  controller.put
)

router.delete(
  "/:OID", 
  auth.authorizeAccess(authCodes.company.delete),
  auth.authorizeSuperAdmin,
  controller.delete
)

module.exports = router;  
