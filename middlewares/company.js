const UsersCol = require("../models/users.js");
const utils = require("../helpers/utils.js");
const moment = require("moment");

exports.assignCompany = async (req, res, next) => {
  try{
    req.body.company = req.user.company;
  } catch(err){
    console.error(err.stack);
    return res.status(500).send({
      error: "Server error"
    })
  }

  next();
}