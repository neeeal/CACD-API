// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/permission.js");
const validation = require("../middlewares/validation.js");
const fileUpload = require("../middlewares/fileUpload.js");
const auth = require("../middlewares/auth.js");
const company = require("../middlewares/company.js");
const multer = require('multer');
const authCodes = require("../config/authCodes.js");

router.get(
  "/byCompany", 
  auth.authorizeAccess(authCodes.permission.readByCompany),
  controller.getByCompany
)

router.get(
  "/:permission",
  auth.authorizeAccess(authCodes.permission.readOne),
  controller.getOne
)

router.get(
  "/", 
  auth.authorizeAccess(authCodes.permission.read),
  controller.get
)

// router.get("/getOne", controller.getOne)
router.post(
  "/", 
  auth.authorizeAccess(authCodes.permission.create), 
  company.assignCompany,
  controller.post
)

router.put(
  "/", 
  auth.authorizeAccess(authCodes.permission.update), 
  company.assignCompany,
  controller.put
)

router.delete(
  "/:OID", 
  auth.authorizeAccess(authCodes.permission.delete), 
  controller.delete
)

module.exports = router;  
