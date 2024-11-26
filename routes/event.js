// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/event.js");
const validation = require("../middlewares/validation.js");
const fileUpload = require("../middlewares/fileUpload.js");
const auth = require("../middlewares/auth.js");
const company = require("../middlewares/company.js");
const authCodes = require("../config/authCodes.js");

router.get(
  "/byCompany/:company", 
  controller.getByCompany
)

router.get(
  "/:event/byCompany/:company",
  controller.getOne
)

router.get(
  "/", 
  auth.authorizeAccess(authCodes.event.read),
  controller.get
)

// router.get("/getOne", controller.getOne)
router.post(
  "/",  
  auth.authorizeAccess(authCodes.event.create),
  fileUpload.fields([
    { name: "featuredPhoto", maxCount: 1 },
    { name: "default", maxCount: 99 }
  ]), 
  company.assignCompany,
  controller.post
)

router.put(
  "/",  
  auth.authorizeAccess(authCodes.event.update),
  fileUpload.fields([
    { name: "featuredPhoto", maxCount: 1 },
    { name: "default", maxCount: 99 }
  ]), 
  company.assignCompany,
  controller.put
)

router.delete(
  "/:OID", 
  auth.authorizeAccess(authCodes.event.delete),
  company.assignCompany,
  controller.delete
)

module.exports = router;  
