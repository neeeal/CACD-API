const UsersCol = require("../models/users.js");
const utils = require("../helpers/utils.js");
const moment = require("moment");

exports.assignCompany = async (req, res, next) => {
  let id;
  try{
    id = req.params.OID || 
    req.query.OID ||
    req.body.OID || 
    req.body.user.OID;
  } catch(err){
    console.error(err.stack);
    return res.status(400).send({
      error: "Invalid OID"
    })
  }

  const user = await UsersCol
  .findOne({_id: id, deletedAt: null})
  .select("_id accessLevel company email")
  .lean();

  req.body.user = user;

  next();
}