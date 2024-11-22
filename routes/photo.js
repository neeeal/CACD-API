// user.js
const express = require("express");
const fileUpload = require("../middlewares/fileUpload.js");
const router = express.Router();
const controller = require("../controllers/photo.js");
const validation = require("../middlewares/validation.js");
const auth = require("../middlewares/auth.js");
const company = require("../middlewares/company.js");

router.get(
  "/", 
  controller.get
)

router.get(
  "/:OID",
  controller.getOne
)
// router.get("/getOne", controller.getOne)
router.post(
  "/", 
  auth.authorizeAccess(),
  fileUpload.single("default"), 
  company.assignCompany,
  controller.post
)

router.put(
  "/", 
  auth.authorizeAccess(),
  fileUpload.fields([
    // { name: "featuredPhoto", maxCount: 1 },
    { name: "default", maxCount: 99 }
  ]), 
  company.assignCompany,
  controller.put
)

router.delete(
  "/:OID", 
  auth.authorizeAccess(),
  company.assignCompany,
  controller.delete
)

module.exports = router;  
