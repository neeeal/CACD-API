// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/team.js");
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
  fileUpload.single("teamPhoto"), 
  company.assignCompany,
  controller.post
)

router.put(
  "/", 
  auth.accessResource,
  fileUpload.single("teamPhoto"), 
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
