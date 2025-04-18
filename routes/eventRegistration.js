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
const newFileUpload = require("../middlewares/newFileUpload.js");

router.get(
  "/byCompany", 
  auth.authorizeAccess(authCodes.eventRegistration.readByCompany),
  controller.getByCompany
)

router.get(
  "/:eventRegistration",
  auth.authorizeAccess(authCodes.eventRegistration.readOne),
  controller.getOne
)

router.get(
  "/", 
  auth.authorizeAccess(authCodes.eventRegistration.read), 
  controller.get
)

// router.get("/getOne", controller.getOne)
router.post(
  "", 
  // fileUpload.single("paymentPhoto"),   
  auth.authorizeAccess(null, true), 
  newFileUpload,
  company.assignCompany,
  controller.post
)

router.put(
  "/statusChange", 
  auth.authorizeAccess(authCodes.eventRegistration.update), 
  // fileUpload.single("paymentPhoto"),  
  // newFileUpload,   
  company.assignCompany,
  controller.status
)

router.put(
  "/", 
  auth.authorizeAccess(authCodes.eventRegistration.update), 
  // fileUpload.single("paymentPhoto"),  
  newFileUpload,   
  company.assignCompany,
  controller.put
)

router.delete(
  "/:OID", 
  auth.authorizeAccess(authCodes.eventRegistration.delete), 
  controller.delete
)

module.exports = router;  
