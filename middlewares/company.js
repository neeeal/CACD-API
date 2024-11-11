const UsersCol = require("../models/users.js");
const utils = require("../helpers/utils.js");
const moment = require("moment");

exports.assignCompany = async (req, res, next) => {
  console.log(req.user)
  try{
    req.body.company = (req.user && req.user.company) || null;
  } catch(err){
    console.error(err.stack);
    return res.status(500).send({
      error: "Server error"
    })
  }

  next();
}