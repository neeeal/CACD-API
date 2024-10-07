const UserCol = require("../models/users.js");
const utils = require("../helpers/utils.js");
const userHelper = require("../helpers/userHelper.js");
const bcrypt = require("bcrypt");
const moment = require("moment");
const saltRounds = 10;

exports.get = async (req, res) => {
  const data = await UserCol.find({
    deletedAt: null,
  })
  .lean();

  res.status(200).send({
    message: "get all active users",
    data: data
  })
}

exports.getOne = async (req, res) => {
  const {name, oid} = req.query;

  const query = {deletedAt: null};
  // TODO: Add name query

  if (oid) {
    if (!utils.isOID(oid)) {
      return res.status(400).send({ message: "Invalid ObjectId" });
    }
    query._id = oid;
  }

  const data = await UserCol.findOne(query)
  .lean();

  if (!data) {
    return res.status(404).send({ message: "User not found" });
  }

  res.status(200).send({
    message: "get user",
    data: data
  })
}

exports.post = async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  const newUser = new UserCol({email, password, firstName, lastName});

  // Hash the password
  const salt = await bcrypt.genSalt(saltRounds);
  newUser.password = await bcrypt.hash(password, salt);

  let result;
  try {
    const duplicate = await userHelper.checkDuplicates(newUser);
    if (duplicate) 
      throw new Error (`${duplicate} already taken`);
    result = await newUser.save();
  }
  catch (err) {
    console.error(err.stack);
    if (err.message.includes('already taken')){
      return res.status(409).send({ message: err.message });
    }
    return res.status(500).send({ message: "Server error" });
  }

  res.status(200).send({
    message: "User post",
    data: result
  })
}

exports.put = async (req, res) => {
  const data = req.body;

  if (data.password === data.oldPassword) 
    return res.status(400).send({ message: "New password cannot be same as old password." });

  // Hash the password
  const salt = await bcrypt.genSalt(saltRounds);
  data.password = await bcrypt.hash(data.password, salt);

  let result;
  try {

    await userHelper.checkPassword({
      oid: data.oid,
      oldPassword: data.oldPassword
    })

    const duplicate = await userHelper.checkDuplicates(data);
    if (duplicate) 
      throw new Error (`${duplicate} already taken`);

    result = await UserCol.findOneAndUpdate(
      { _id: data.oid },
      {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName,
        updatedAt: moment().toISOString()
      },
      { new: true }
    );

  }
  catch (err) {
    console.error(err.stack);

    if (err.message.includes('already taken')){
      return res.status(409).send({ message: err.message });
    }

    if (err.message.includes('Incorrect password')){
      return res.status(409).send({ message: err.message });
    }

    if (err.message.includes("User not found"))
      return res.status(404).send({ message: err.message });

    return res.status(500).send({ message: "Server error" });
  }

  res.status(200).send({
    message: "User put",
    data: result
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