// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/admin.js");
const validation = require("../middlewares/validation.js");
const fileUpload = require("../middlewares/fileUpload.js");
const auth = require("../middlewares/auth.js");
const company = require("../middlewares/company.js");
const authCodes = require("../config/authCodes.js");

router.get(
  "/", 
  auth.authorizeAccess(authCodes.admin.read),
  controller.get
)

router.get(
  "/:adminOid/company/:companyOid", 
  controller.getOne
)

// router.get("/getOne", controller.getOne)
router.post(
  "/", 
  auth.authorizeAccess(authCodes.admin.create),
  fileUpload.single("adminPhoto"), 
  controller.post
)

router.put(
  "/", 
  auth.authorizeAccess(authCodes.admin.update),
  fileUpload.single("adminPhoto"), 
  controller.put
)

router.delete(
  "/:OID", 
  auth.authorizeAccess(authCodes.admin.delete),
  controller.delete
)

module.exports = router;  
