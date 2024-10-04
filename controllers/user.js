const UserCol = require("../models/users.js");
const bcrypt = require("bcrypt");
const moment = require("moment");
const saltRounds = 10;

exports.get = async (req, res) => {
  res.status(200).send({
    message: "User get",
  })
}

exports.getOne = async (req, res) => {

}

exports.post = async (req, res) => {
  const { email, username, password, firstName, lastName } = req.body;
  const newUser = new UserCol({email, username, password, firstName, lastName});

  // Hash the password
  const salt = await bcrypt.genSalt(saltRounds);
  newUser.password = await bcrypt.hash(password, salt);

  let result;
  try {
    result = await newUser.save();
  }
  catch (err) {
    console.error(err.stack);
    return res.status(500).send({ message: "Server error" });
  }

  res.status(200).send({
    message: "User post",
    data: result
  })
}

exports.put = async (req, res) => {
  res.status(200).send({
    message: "User put",
  })
}

exports.delete = async (req, res) => {
  const { oid } = req.params; 

  let userDoc;
  try {
    userDoc = await UserCol.findOneAndUpdate(
      { 
        _id: oid, 
        deletedAt: null
      },
      {
        $set: {
          deletedAt: moment().toISOString()
        }
    }
  );
  } catch (err){
    console.error(err.stack);
    return res.status(500).send({ message: "Server error" });
  }

  if (!userDoc) {
    return res.status(404).send({ message: "User not found" });
  }
  
  res.status(200).send({
    message: "User deleted",
    data: {
      oid: oid
    }
  })
}