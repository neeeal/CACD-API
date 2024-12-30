// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/rolePermission.js");
const validation = require("../middlewares/validation.js");
const fileUpload = require("../middlewares/fileUpload.js");
const auth = require("../middlewares/auth.js");
const company = require("../middlewares/company.js");
const multer = require('multer');
const authCodes = require("../config/authCodes.js");

router.get(
  "/byCompany", 
  auth.authorizeAccess(authCodes.rolePermission.readByCompany),
  controller.getByCompany
)

router.get(
  "/:rolePermission",
  auth.authorizeAccess(authCodes.rolePermission.readOne),
  controller.getOne
)

router.get(
  "/", 
  auth.authorizeAccess(authCodes.rolePermission.read),
  controller.get
)

// router.get("/getOne", controller.getOne)
router.post(
  "/", 
  auth.authorizeAccess(authCodes.rolePermission.create), 
  company.assignCompany,
  controller.post
)

router.post(
  "/manageRolePermissions", 
  auth.authorizeAccess(authCodes.rolePermission.manageRolePermissions), 
  company.assignCompany,
  controller.manageRolePermissions
)

router.put(
  "/", 
  auth.authorizeAccess(authCodes.rolePermission.update), 
  company.assignCompany,
  controller.put
)

router.delete(
  "/:OID", 
  auth.authorizeAccess(authCodes.rolePermission.delete),
  controller.delete
)

module.exports = router;  
