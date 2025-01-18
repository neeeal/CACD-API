// // user.js
// const express = require("express");
// const router = express.Router();
// const controller = require("../controllers/ticket.js");
// const validation = require("../middlewares/validation.js");
// const fileUpload = require("../middlewares/fileUpload.js");
// const auth = require("../middlewares/auth.js");
// const company = require("../middlewares/company.js");
// const authCodes = require("../config/authCodes.js");

// router.get(
//   "/byCompany", 
//   auth.authorizeAccess(authCodes.ticket.readByCompany),
//   controller.getByCompany
// )

// router.get(
//   "/:ticket",
//   auth.authorizeAccess(authCodes.ticket.readOne),
//   controller.getOne
// )

// router.get(
//   "/", 
//   auth.authorizeAccess(authCodes.ticket.read),
//   controller.get
// )

// // router.get("/getOne", controller.getOne)
// router.post(
//   "/:company", 
//   // fileUpload.fields([
//   //   { name: "ticketPhotos", maxCount: 10 }, // upload up to 10 files
//   // ]), 
//   company.assignCompany,
//   controller.post
// )

// router.put(
//   "/", 
//   auth.authorizeAccess(authCodes.ticket.update),
//   // fileUpload.fields([
//   //   { name: "ticketPhotos", maxCount: 10 }, // upload up to 10 files
//   // ]), 
//   company.assignCompany,
//   controller.put
// )

// router.delete(
//   "/:OID", 
//   auth.authorizeAccess(authCodes.ticket.delete),
//   company.assignCompany,
//   controller.delete
// )

// module.exports = router;  
