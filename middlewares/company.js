const UsersCol = require("../models/users.js");
const utils = require("../helpers/utils.js");
const moment = require("moment");

exports.assignCompany = async (req, res, next) => {
  console.log(req.user)
  try{
    req.body.company = (req.user?.company) || (req.params?.company) || req.body?.company;
    if(!req.body.company){
      return res.status(400).send({
        error: "Company is required"
      })
    }
  } catch(err){
    console.error(err.stack);
    return res.status(500).send({
      error: "Server error"
    })
  }

  next();
}