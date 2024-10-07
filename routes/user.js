// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.js");
const validation = require("../middlewares/validation.js");

router.get("/", controller.get)
router.get("/getOne", controller.getOne)
router.post("/", validation.userRegisterAndUpdate, validation.passwordConfirmation, controller.post)
router.put("/", validation.userRegisterAndUpdate, validation.passwordConfirmation, controller.put)
router.delete("/:oid", controller.delete)

module.exports = router;  
