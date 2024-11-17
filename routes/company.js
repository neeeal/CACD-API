// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/company.js");
const validation = require("../middlewares/validation.js");
const fileUpload = require("../middlewares/fileUpload.js");
const auth = require("../middlewares/auth.js");

router.get(
  "/", 
  auth.accessResource,
  auth.authorizeSuperAdmin,
  controller.get
)

// router.get("/getOne", controller.getOne)
router.post(
  "/", 
  auth.accessResource,
  auth.authorizeSuperAdmin,
  fileUpload.single("companyPhoto"), 
  controller.post
)

router.put(
  "/", 
  auth.accessResource,
  auth.authorizeSuperAdmin,
  fileUpload.single("companyPhoto"), 
  controller.put
)

router.delete(
  "/:OID", 
  auth.accessResource,
  auth.authorizeSuperAdmin,
  controller.delete
)

module.exports = router;  
