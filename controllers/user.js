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
  const {name, OID} = req.query;

  const query = {deletedAt: null};
  // TODO: Add name query

  if (OID) {
    if (!utils.isOID(OID)) {
      return res.status(400).send({ error: "Invalid ObjectId" });
    }
    query._id = OID;
  }

  const data = await UserCol.findOne(query)
  .lean();

  if (!data) {
    return res.status(404).send({ error: "User not found" });
  }

  res.status(200).send({
    message: "get user",
    data: data
  })
}

exports.post = async (req, res) => {
  console.log("here")
  const { email, password, firstName, lastName } = req.body;
  const newUser = new UserCol({email, password, firstName, lastName});
  const uploadedPhoto = req.file;

  // Hash the password
  const salt = await bcrypt.genSalt(saltRounds);
  newUser.password = await bcrypt.hash(password, salt);

  if (uploadedPhoto) {
    try{
      const savedPhoto = await utils.savePhoto({uploadedPhoto:uploadedPhoto, details:newUser});
      newUser.photos = savedPhoto._id;
    }
    catch (err){
      console.error(err.stack);
      return res.status(500).send({ error: "Server error" });
    }
  }

  let data;
  try {
    const duplicate = await userHelper.checkDuplicates(newUser);
    if (duplicate) 
      throw new Error (`${duplicate} already taken`);
    data = await newUser.save();
  }
  catch (err) {
    console.error(err.stack);
    if (err.message.includes('already taken')){
      return res.status(409).send({ message: err.message });
    }
    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "User post",
    data: data
  })
}

exports.put = async (req, res) => {
  const newUser = req.body;
  const uploadedPhoto = req.file;

  const query = { _id: newUser.OID, deletedAt: null }

  if (newUser.password === newUser.oldPassword) 
    return res.status(400).send({ error: "New password cannot be same as old password." });

  // Hash the password
  const salt = await bcrypt.genSalt(saltRounds);
  newUser.password = await bcrypt.hash(newUser.password, salt);

  let oldPhotos;
  try{
    oldPhotos = await utils.getOldPhotos({ col: UserCol, query: query });
  }
  catch (err){
    console.log("Old Photo Retrieval")
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }

  if (uploadedPhoto) {
    uploadedPhoto.fieldname = 
    uploadedPhoto.fieldname.includes("new") ?
      uploadedPhoto.fieldname.replace(/^new/, "").replace(/^./, (char) => char.toLowerCase()) :
      uploadedPhoto.fieldname;
    
    try{
      let savedPhoto;
      if (oldPhotos){
        newUser.photos = oldPhotos.photos && oldPhotos.photos._id;
        savedPhoto = await utils.updatePhoto({uploadedPhoto:uploadedPhoto, details:newUser});
      } else {
        savedPhoto = await utils.savePhoto({uploadedPhoto:uploadedPhoto, details:newUser});
    }
      console.log(oldPhotos)
      newUser.photos = savedPhoto._id;
    }
    catch (err){
      console.error(err.stack);
      return res.status(500).send({ error: "Server error" });
    }
  } else if (!uploadedPhoto && oldPhotos.photos){
    console.log("tyet");
    console.log(oldPhotos.photos._id)
    await utils.softDeletePhoto(oldPhotos.photos._id);
  }

  const values = {
    $set: {
      email: newUser.email,
      password: newUser.password,
      firstName: newUser.firstName,
      lastName: newUser.lastName,
      updatedAt: moment().toISOString(),
      photos: newUser.photos || null,
    }
  }

  const options = { new: true };
  let data;
  try {

    await userHelper.checkPassword({
      OID: newUser.OID,
      oldPassword: newUser.oldPassword
    })

    const duplicate = await userHelper.checkDuplicates(newUser);
    if (duplicate) 
      throw new Error (`${duplicate} already taken`);

    data = await UserCol.findOneAndUpdate(query, values, options);

  }
  catch (err) {
    console.error(err.stack);

    if (err.message.includes('already taken')){
      return res.status(409).send({ message: err.message });
    }

    if (err.message.includes('Incorrect password')){
      return res.status(409).send({ message: err.message });
    }

    if (err.message.includes("not found"))
      return res.status(404).send({ error: err.message });

    if (err.message.includes("Cast to ObjectId failed"))
      return res.status(404).send({
      message: "Invalid Object ID"
    });
    
    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "User put",
    data: data
  })
}

exports.delete = async (req, res) => {
  const { OID } = req.params; 

  let userDoc;
  try {
    userDoc = await UserCol.findOneAndUpdate(
      { 
        _id: OID, 
        deletedAt: null
      },
      {
        $set: {
          deletedAt: moment().toISOString()
        }
    }
  );
  await utils.deletePhoto(userDoc.photos)
} catch (err){
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }

  if (!userDoc) {
    return res.status(404).send({ error: "User not found" });
  }
  
  res.status(200).send({
    message: "User deleted",
    data: {
      OID: OID
    }
  })
}