const UserCol = require("../models/users.js");
const utils = require("../helpers/utils.js");
const userHelper = require("../helpers/userHelper.js");
const bcrypt = require("bcrypt");
const moment = require("moment");
const RolesCol = require("../models/roles.js");

exports.get = async (req, res) => {
  const queryParams = req.query || {};

  let data;
  try{

    const query = utils.queryBuilder({
      initialQuery: { deletedAt: null },
      queryParams: queryParams
    });

    data = await utils.getAndPopulate({
      query: query,
      col: UserCol,
      offset: queryParams.offset,
      limit: queryParams.limit
    });
  } catch (err) {
    console.error(err.stack);

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message)){
      return res.status(404).send({ error: "Invalid ObjectId" });
    }

    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "get all active users",
    data: data || [],
    count: data && data.length
  })
}

exports.getOne = async (req, res) => {
  // TODO: add middleware for query company validation (consider)
  const queryParams = req.query || {};
  const { OID } = req.params;

  let data;
  try{
    const query = utils.queryBuilder({
      initialQuery: { deletedAt: null, _id: OID },
      queryParams: { company: queryParams?.company }
    });

    data = await utils.getAndPopulate({
      query: query,
      col: UserCol,
    });
    
  } catch (err) {
    console.error(err.stack);

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message)){
      return res.status(404).send({ error: "Invalid ObjectId" });
    }

    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "User get",
    data: data?.[0] || [],
    count: data && data.length 
  })
}

exports.post = async (req, res) => {
  // TODO: modularize getting role ID
  const role = await RolesCol.findOne({ name: "User", deletedAt: null}).lean();
  console.log("here")
  let newUser = req.body;
  newUser = new UserCol({
    ...newUser,
    company: newUser.company,
    role: role._id
  });
  const uploadedPhotos = req.file;

  // Hash the password
  const salt = await bcrypt.genSalt(10);
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

    // check only if change password 
  if( newUser.password && newUser.password.trim().length > 0){
    if (newUser.password !== newUser.passwordConfirmation)
      return res.status(400).send({ error: "Passwords do not match" });

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    newUser.password = await bcrypt.hash(newUser.password, salt);
  }
  
  const uploadedPhotos = req.file;

  const query = { _id: newUser.OID, deletedAt: null }

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

    if ((newUser.password === newUser.oldPassword) && newUser.password.trim().length > 0) 
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

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message))
      return res.status(404).send({
      error: "Invalid Object ID"
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

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message))
      return res.status(404).send({
      error: "Invalid Object ID"
    });

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