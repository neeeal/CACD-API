// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/company.js");
const validation = require("../middlewares/validation.js");
const fileUpload = require("../middlewares/fileUpload.js");
const auth = require("../middlewares/auth.js");

router.get(
  "/", 
  controller.get
)

// router.get("/getOne", controller.getOne)
router.post(
  "/", 
  auth.accessResource,
  fileUpload.single("companyPhoto"), 
  controller.post
)

router.put(
  "/", 
  auth.accessResource,
  fileUpload.single("newCompanyPhoto"), 
  controller.put
)

router.delete(
  "/:OID", 
  auth.accessResource,
  controller.delete
)

module.exports = router;  
