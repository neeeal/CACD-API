// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/church.js");
const fileUpload = require("../middlewares/fileUpload.js");
const auth = require("../middlewares/auth.js");
const company = require("../middlewares/company.js");
const authCodes = require("../config/authCodes.js");

router.get(
  "/byCompany/:company", 
  controller.getByCompany
)

router.get(
  "/:church/byCompany/:company",
  controller.getOne
)

router.get(
  "/", 
  auth.authorizeAccess(authCodes.church.read),
  controller.get
)

// router.get("/getOne", controller.getOne)
router.post(
  "/", 
  auth.authorizeAccess(authCodes.church.create),
  fileUpload.fields([
    { name: "featuredPhoto", maxCount: 1 },
    { name: "default", maxCount: 99 }
  ]), 
  company.assignCompany,
  controller.post
)

router.put(
  "/", 
  auth.authorizeAccess(authCodes.church.update),
  fileUpload.fields([
    { name: "featuredPhoto", maxCount: 1 },
    { name: "default", maxCount: 99 }
  ]), 
  company.assignCompany,
  controller.put
)

router.delete(
  "/:OID",
  auth.authorizeAccess(authCodes.church.delete),
  company.assignCompany,
  controller.delete
)

module.exports = router;  
