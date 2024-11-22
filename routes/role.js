// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/role.js");
const validation = require("../middlewares/validation.js");
// const fileUpload = require("../middlewares/fileUpload.js");
const auth = require("../middlewares/auth.js");
const multer = require('multer');
const company = require("../middlewares/company.js");

router.get(
  "/", 
  controller.get
)

router.get(
  "/:roleOid/company/:companyOid",
  controller.getOne
)
// router.get("/getOne", controller.getOne)
router.post(
  "/",   
  auth.authorizeAccess(), 
  multer().none(),   
  company.assignCompany,
  controller.post
)

router.put(
  "/",   
  multer().none(),   
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
