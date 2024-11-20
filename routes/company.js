// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/company.js");
const validation = require("../middlewares/validation.js");
const fileUpload = require("../middlewares/fileUpload.js");
const auth = require("../middlewares/auth.js");

router.get(
  "/", 
  auth.authorizeAccess(),
  auth.authorizeSuperAdmin,
  controller.get
)

// router.get("/getOne", controller.getOne)
router.post(
  "/", 
  auth.authorizeAccess(),
  auth.authorizeSuperAdmin,
  fileUpload.single("companyPhoto"), 
  controller.post
)

router.put(
  "/", 
  auth.authorizeAccess(),
  auth.authorizeSuperAdmin,
  fileUpload.single("companyPhoto"), 
  controller.put
)

router.delete(
  "/:OID", 
  auth.authorizeAccess(),
  auth.authorizeSuperAdmin,
  controller.delete
)

module.exports = router;  
