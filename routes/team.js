// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/team.js");
const validation = require("../middlewares/validation.js");
const fileUpload = require("../middlewares/fileUpload.js");

router.get("/", controller.get)
router.get("/getOne", controller.getOne)
router.post("/", 
  fileUpload.single("teamPhoto"), 
  controller.post
)
router.put("/", 
  fileUpload.single("newTeamPhoto"), 
  controller.put
)
router.delete("/:OID", controller.delete)

module.exports = router;  
