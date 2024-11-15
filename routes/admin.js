// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/admin.js");
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
)

router.put(
  "/", 
)

router.delete(
  "/:OID", 
)

module.exports = router;  
