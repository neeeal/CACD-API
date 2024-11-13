const UserCol = require("../models/users.js");
const utils = require("../helpers/utils.js");
const userHelper = require("../helpers/userHelper.js");
const bcrypt = require("bcrypt");
const moment = require("moment");
const saltRounds = 10;

exports.get = async (req, res) => {
  const queryParams = req.query || {};

  const query = utils.queryBuilder({
    initialQuery: { deletedAt: null },
    queryParams: queryParams
  });

  let data;
  try{
    data = await utils.getAndPopulate({
      query: query,
      col: UserCol,
      offset: queryParams.offset,
      limit: queryParams.limit
    });
  } catch (err) {
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "get all active users",
    data: data || [],
    count: data && data.length
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

  let data;
  try{
  data = await utils.getAndPopulate({
    query: query,
    col: UserCol,
    offset: queryParams.offset,
    limit: queryParams.limit
  });
  } catch (err) {
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }

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
  let newUser = req.body;
  newUser = new UserCol({
    ...newUser,
    company: newUser.company
  });
  const uploadedPhotos = req.file;

  // Hash the password
  const salt = await bcrypt.genSalt(saltRounds);
  newUser.password = await bcrypt.hash(newUser.password, salt);

  if (uploadedPhotos) {
    try{
      const savedPhotos = await utils.savePhotos({uploadedPhotos:uploadedPhotos, details:newUser});
      newUser.photos = [savedPhotos._id];
      console.log("IM HERE")
      console.log([savedPhotos._id])
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
    console.log("DATA")
    console.log(newUser)
    console.log("DATA")
    data = await utils.saveAndPopulate({doc:newUser, col:UserCol});
  }
  catch (err) {
    console.error(err.stack);
    if (err.message.includes('already taken')){
      return res.status(409).send({ error: err.message });
    }
    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "User post",
    data: data
  })
}

exports.put = async (req, res) => {
  let newUser = req.body;
  const uploadedPhotos = req.file;

  const query = { _id: newUser.OID, deletedAt: null }

  // Hash the password
  const salt = await bcrypt.genSalt(saltRounds);
  newUser.password = await bcrypt.hash(newUser.password, salt);

  try{
    newUser = await utils.managePhotosUpdate({
      col: UserCol,
      query: query,
      uploadedPhotos: uploadedPhotos,
      newDoc: newUser
    });
  } catch(err){
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }

  const values = {
    $set: {
      ...newUser
    }
  }

  const options = { new: true };
  try {
    console.log("Sdfsdf")
    console.log(newUser)
    const correctPassword = await userHelper.checkPassword({
      data: newUser,
      oldPassword: newUser.oldPassword
    })

    if (!correctPassword) 
      throw new Error ('Incorrect password');

    if (newUser.password === newUser.oldPassword) 
      throw new Error("New password cannot be same as old password.");  

    const duplicate = await userHelper.checkDuplicates(newUser);
    if (duplicate) 
      throw new Error (`${duplicate} already taken`);

    newUser = await utils.updateAndPopulate({ query: query, values: values, options: options, col: UserCol });

    if (!newUser) 
      throw new Error("Team not found");

  }
  catch (err) {
    console.error(err.stack);

    if (err.message.includes('cannot be same')){
      return res.status(409).send({ error: err.message });
    }

    if (err.message.includes('already taken')){
      return res.status(409).send({ error: err.message });
    }

    if (err.message.includes('Incorrect password')){
      return res.status(409).send({ error: err.message });
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
    data: newUser
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
  console.log(userDoc)
  await utils.softDeletePhotos({photos: userDoc.photos, doc:userDoc, col:UserCol})
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