// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/company.js");
const validation = require("../middlewares/validation.js");
const fileUpload = require("../middlewares/fileUpload.js");

router.get("/", controller.get)
// router.get("/getOne", controller.getOne)
router.post("/", 
  fileUpload.single("companyPhoto"), 
  controller.post
)
router.put("/", 
  fileUpload.single("newCompanyPhoto"), 
  controller.put
)
router.delete("/:OID", controller.delete)

module.exports = router;  
