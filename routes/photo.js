// user.js
const express = require("express");
const fileUpload = require("../middlewares/fileUpload.js");
const router = express.Router();
const controller = require("../controllers/photo.js");
const validation = require("../middlewares/validation.js");
const auth = require("../middlewares/auth.js");

router.get(
  "/", 
  controller.get
)

// router.get("/getOne", controller.getOne)
router.post(
  "/", 
  auth.accessResource,
  fileUpload.single("default"), 
  controller.post
)

router.put(
  "/", 
  auth.accessResource,
  fileUpload.fields([
    // { name: "featuredPhoto", maxCount: 1 },
    { name: "default", maxCount: 99 }
  ]), 
  controller.put
)

router.delete(
  "/:OID", 
  auth.accessResource,
  controller.delete
)

module.exports = router;  
