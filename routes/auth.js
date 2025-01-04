// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth.js");
const company = require("../middlewares/company.js");
const auth = require("../middlewares/auth.js");
const multer = require('multer');
const authCodes = require("../config/authCodes.js");

router.post(
  "/login", 
  controller.login
)

router.post(
  "/logout", 
  auth.authorizeAccess(), 
  company.assignCompany,
  controller.logout
)

router.post(
  "/refresh", 
  // company.assignCompany,
  controller.refreshToken
);

router.post(
  "/forgotPassword", 
  controller.forgotPassword
)

router.put(
  "/resetPassword", 
  controller.resetPassword
)

module.exports = router;  
