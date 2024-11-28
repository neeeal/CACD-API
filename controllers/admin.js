const AdminsCol = require("../models/users.js");
const utils = require("../helpers/utils.js");
const bcrypt = require("bcrypt");
const userHelper = require("../helpers/userHelper.js");
const rolePermissionHelper = require("../helpers/rolePermissionHelper.js");
const moment = require("moment");
const RolesCol = require("../models/roles.js");

// TODO: consider separating business logic in controllers, create services folder
exports.get = async (req, res) => {
  const queryParams = req.query || {};
  const { company } = req.user;

  let data;
  try{
    const role = await rolePermissionHelper.getRoleByName({name: "user", returnIdOnly: true, company: company}); 
    const query = utils.queryBuilder({
      initialQuery: { deletedAt: null, role: {$ne: role} },
      queryParams: queryParams,
    });

    data = await utils.getAndPopulate({
      query: query,
      col: AdminsCol,
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
    message: "get all active admins",
    data: data || [],
    count: data && data.length
  })
}

exports.getOne = async (req, res) => {
  const params = req.params;
  const user = req.user;

  let data;
  try{
    const query = { deletedAt: null, _id: params.admin, company: user.company };

    data = await utils.getAndPopulate({
      query: query,
      col: AdminsCol,
    });
    
  } catch (err) {
    console.error(err.stack);

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message)){
      return res.status(404).send({ error: "Invalid ObjectId" });
    }

    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "admin get",
    data: data?.[0] || [],
    count: data && data.length 
  })
}

exports.getByCompany = async (req, res) => {
  const queryParams = req.query || {};
  const user = req.user;

  let data;
  try{
    const query = utils.queryBuilder({
      initialQuery: { deletedAt: null, company: user.company },
      queryParams: queryParams,
    });

    // TODO: add argument on get and populate to choose fields to populate
    data = await utils.getAndPopulate({
      query: query,
      col: AdminsCol,
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
    data: data || [],
    count: data && data.length 
  })
}

exports.post = async (req, res) => {
  console.log("here")
  let newAdmin = req.body;
  const company = newAdmin.company;

  if (!newAdmin.role) {
    newAdmin.role = "moderator"; // default moderator access level
  }

  newAdmin.role = await rolePermissionHelper.getRoleByName({name: newAdmin.role, returnIdOnly: true, company: company})

  newAdmin = new AdminsCol({
    ...newAdmin,
    company: company
  });
  const uploadedPhotos = req.file;

  // Hash the password
  const salt = await bcrypt.genSalt(10);
  console.log(newAdmin)
  newAdmin.password = await bcrypt.hash(newAdmin.password, salt);

  if (uploadedPhotos) {
    try{
      const savedPhotos = await utils.savePhotos({uploadedPhotos:uploadedPhotos, details:newAdmin});
      newAdmin.photos = [savedPhotos._id];
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
    const duplicate = await userHelper.checkDuplicates(newAdmin);
    if (duplicate) 
      throw new Error (`${duplicate} already taken`);
    console.log("DATA")
    console.log(newAdmin)
    console.log("DATA")
    data = await utils.saveAndPopulate({doc:newAdmin, col:AdminsCol});
  }
  catch (err) {
    console.error(err.stack);
    if (err.message.includes('already taken')){
      return res.status(409).send({ error: err.message });
    }
    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "Admin post",
    data: data
  })
}

exports.put = async (req, res) => {
  let newAdmin = req.body;
  const { company } = req.user;
  
  const uploadedPhotos = req.file;

  const query = { 
    _id: newAdmin.OID, 
    deletedAt: null, 
    company: company 
  };

  // if has password to be set
  if (newAdmin.password && newAdmin.password.trim().length > 0){
    if (newAdmin.password !== newAdmin.passwordConfirmation)
      return res.status(400).send({ error: "Passwords do not match" });
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    newAdmin.password = await bcrypt.hash(newAdmin.password, salt);
  }

  try{
    newAdmin = await utils.managePhotosUpdate({
      col: AdminsCol,
      query: query,
      uploadedPhotos: uploadedPhotos,
      newDoc: newAdmin
    });
  } catch(err){
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }

  const values = {
    $set: {
      ...newAdmin
    }
  }

  const options = { new: true };
  try {
    console.log("Sdfsdf")
    console.log(newAdmin)
    const correctPassword = await userHelper.checkPassword({
      data: newAdmin,
      oldPassword: newAdmin.oldPassword
    })

    if (!correctPassword) 
      throw new Error ('Incorrect password');

    if ((newAdmin.password === newAdmin.oldPassword) && newAdmin.password.trim().length > 0) 
      throw new Error("New password cannot be same as old password.");  

    const duplicate = await userHelper.checkDuplicates(newAdmin);
    if (duplicate) 
      throw new Error (`${duplicate} already taken`);

    newAdmin = await utils.updateAndPopulate({ query: query, values: values, options: options, col: AdminsCol });

    if (!newAdmin) 
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
    message: "Admin put",
    data: newAdmin
  })
}

exports.delete = async (req, res) => {
  const { OID } = req.params; 
  const { company } = req.user;

  let adminDoc;
  try {
    adminDoc = await AdminsCol.findOneAndUpdate(
      { 
        _id: OID, 
        deletedAt: null,
        company: company
      },
      {
        $set: {
          deletedAt: moment().toISOString()
        }
    }
  );
  console.log(adminDoc)
  await utils.softDeletePhotos({photos: adminDoc.photos, doc:adminDoc, col:AdminsCol})
} catch (err){
    console.error(err.stack);

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message))
      return res.status(404).send({
      error: "Invalid Object ID"
    });
    
    return res.status(500).send({ error: "Server error" });
  }

  if (!adminDoc) {
    return res.status(404).send({ error: "Admin not found" });
  }
  
  res.status(200).send({
    message: "Admin deleted",
    data: {
      OID: OID
    }
  })
}