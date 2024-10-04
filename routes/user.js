// user.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/user.js");

router.get("/", controller.get)
router.post("/", controller.post) // TODO: Add validation middleware
router.put("/", controller.put)
router.delete("/:oid", controller.delete)

module.exports = router;  
