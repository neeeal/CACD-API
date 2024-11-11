// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/event.js");
const validation = require("../middlewares/validation.js");
const fileUpload = require("../middlewares/fileUpload.js");
const auth = require("../middlewares/auth.js");
const company = require("../middlewares/company.js");

router.get(
  "/", 
  controller.get
)

// router.get("/getOne", controller.getOne)
router.post(
  "/",  
  auth.accessResource,
  fileUpload.fields([
    { name: "featuredPhoto", maxCount: 1 },
    { name: "default", maxCount: 99 }
  ]), 
  company.assignCompany,
  controller.post
)

router.put(
  "/",  
  auth.accessResource,
  fileUpload.fields([
    { name: "newFeaturedPhoto", maxCount: 1 },
    { name: "newDefault", maxCount: 99 }
  ]), 
  company.assignCompany,
  controller.put
)

router.delete(
  "/:OID", 
  auth.accessResource,
  company.assignCompany,
  controller.delete
)

module.exports = router;  
