// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/role.js");
const validation = require("../middlewares/validation.js");
// const fileUpload = require("../middlewares/fileUpload.js");
const auth = require("../middlewares/auth.js");
const multer = require('multer');
const company = require("../middlewares/company.js");
const authCodes = require("../config/authCodes.js");

router.get(
  "/byCompany", 
  auth.authorizeAccess(authCodes.role.readByCompany),
  controller.getByCompany
)

router.get(
  "/:role",
  auth.authorizeAccess(authCodes.role.readOne),
  controller.getOne
)

router.get(
  "/", 
  auth.authorizeAccess(authCodes.role.read), 
  controller.get
)

// router.get("/getOne", controller.getOne)
router.post(
  "/",   
  auth.authorizeAccess(authCodes.role.create), 
  company.assignCompany,
  controller.post
)

router.put(
  "/",   
  auth.authorizeAccess(authCodes.role.update), 
  company.assignCompany,
  controller.put
)

router.delete(
  "/:OID", 
  auth.authorizeAccess(authCodes.role.delete), 
  company.assignCompany,
  controller.delete
)

module.exports = router;  
