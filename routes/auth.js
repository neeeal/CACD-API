// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/auth.js");
const company = require("../middlewares/company.js");
const auth = require("../middlewares/auth.js");
const multer = require('multer');

router.post(
  "/login", 
  multer().none(), 
  controller.login
)

router.post(
  "/logout", 
  auth.accessResource, 
  multer().none(), 
  company.assignCompany,
  controller.logout
)

router.post(
  "/refresh", 
  multer().none(), 
  company.assignCompany,
  controller.refreshToken
);

router.post(
  "/forgotPassword", 
  multer().none(), 
  controller.forgotPassword
)

router.put(
  "/resetPassword", 
  multer().none(), 
  controller.resetPassword
)

module.exports = router;  
