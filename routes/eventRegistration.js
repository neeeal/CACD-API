// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/eventRegistration.js");
const validation = require("../middlewares/validation.js");
const fileUpload = require("../middlewares/fileUpload.js");
const auth = require("../middlewares/auth.js");
const company = require("../middlewares/company.js");
const multer = require('multer');
const authCodes = require("../config/authCodes.js");

router.get(
  "/", 
  auth.authorizeAccess(authCodes.eventRegistration.read), 
  controller.get
)

router.get(
  "/:eventRegistrationOid/company/:companyOid",
  controller.getOne
)
// router.get("/getOne", controller.getOne)
router.post(
  "/", 
  fileUpload.single("paymentPhoto"),   
  company.assignCompany,
  controller.post
)

router.put(
  "/", 
  auth.authorizeAccess(authCodes.eventRegistration.update), 
  fileUpload.single("paymentPhoto"),     
  company.assignCompany,
  controller.put
)

router.delete(
  "/:OID", 
  auth.authorizeAccess(authCodes.eventRegistration.delete), 
  controller.delete
)

module.exports = router;  
