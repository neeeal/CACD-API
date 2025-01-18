// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/company.js");
const validation = require("../middlewares/validation.js");
const fileUpload = require("../middlewares/fileUpload.js");
const auth = require("../middlewares/auth.js");
const authCodes = require("../config/authCodes.js");
const newFileUpload = require("../middlewares/newFileUpload.js");

router.get(
  "/:company",
  controller.getOne
)

router.get(
  "/", 
  auth.authorizeAccess(authCodes.company.read),
  controller.get
)

// router.get("/getOne", controller.getOne)
router.post(
  "/", 
  auth.authorizeAccess(authCodes.company.create),
  newFileUpload,
  controller.post
)

router.put(
  "/", 
  auth.authorizeAccess(authCodes.company.update),
  newFileUpload, 
  controller.put
)

router.delete(
  "/:OID", 
  auth.authorizeAccess(authCodes.company.delete),
  controller.delete
)

module.exports = router;  
