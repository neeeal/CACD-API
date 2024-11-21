const RolePermissionsCol = require("../models/rolePermissions.js");
const utils = require("../helpers/utils.js");
const rolePermissionHelper = require("../helpers/rolePermissionHelper.js");
const moment = require("moment");

exports.get = async (req, res) => {
  const queryParams = req.query || {};

  let data;
  try{
    const query = utils.queryBuilder({
      initialQuery: { deletedAt: null },
      queryParams: queryParams,
    });
    
    data = await utils.getAndPopulate({
      query: query,
      col: RolePermissionsCol,
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
    message: "get all active role permissions",
    data: data || [],
    count: data && data.length
  })
};

exports.post = async (req, res) => {
  const newRolePermission = req.body;

  let newRolePermissionDoc;
  try {
    const role = await rolePermissionHelper.manageSaveRole({
      roleData: {
        ...newRolePermission.role,
        company: newRolePermission.company
      }
    });
  
    const permission = await rolePermissionHelper.manageSavePermission({
      permissionData: {
        ...newRolePermission.permission,
        company: newRolePermission.company,
      }
    });

    const name = rolePermissionHelper.formatRolePermissionName({
      role: role, 
      permission: permission, 
    });
  
    newRolePermission.name = name;
    newRolePermission.role = role._id;
    newRolePermission.permission = permission._id;
    
    console.log(newRolePermission);

    const existingRolePermissions = await rolePermissionHelper.checkExistingRolePermissions({
      company: newRolePermission.company, 
      roles: [role], 
      permissions:[permission]
    });

    newRolePermissionDoc = new RolePermissionsCol(newRolePermission);
    const savedDoc = await newRolePermissionDoc.save();
  } catch (err) {
    console.error(err.stack);

    // Check if the error is a duplicate key error
    if (err.name === 'MongoServerError' && err.code === 11000) {
      return res.status(400).send({
        error: "Duplicate key error. A role permission with this name already exists.",
      });
    }

    if (err.message.includes("role-permission combinations already exist")){
      return res.status(400).send({ error: err.message });
    }

    if (err.message.includes("does not exist. Please create a")){
      return res.status(404).send({ error: err.message });
    }

    // General server error response
    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "post",
    data: newRolePermissionDoc
  });
};

exports.put = async (req, res) => {
  let newRolePermission = req.body;

  const query = {
    _id: newRolePermission.OID,
    deletedAt: null
  };

  const values = {
    $set: {
      ...newRolePermission
    }
  };

  const options = { new: true };

  try {
    newRolePermission = await utils.updateAndPopulate({ query: query, values: values, options: options, col: RolePermissionsCol });

    if (!newRolePermission) 
      throw new Error("Role Permission not found");

  } catch (err) {
    console.error(err.stack);

    // Handle "Permission not found" error
    if (err.message.includes("not found")) {
      return res.status(404).send({ error: err.message });
    }

    // Handle invalid Object ID error
    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message)) {
      return res.status(400).send({ error: "Invalid Object ID" });
    }

    // Handle duplicate key error (MongoServerError with code 11000)
    if (err.code === 11000) {
      return res.status(400).send({
        error: `Duplicate key error. A role permission with this ${Object.keys(err.keyValue).join(', ')} already exists.`,
      });
    }

    // General server error
    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "put",
    data: newRolePermission
  });
};

exports.delete = async (req, res) => {
  
  const { OID } = req.params; 

  let newRolePermission;
  try {
    newRolePermission = await RolePermissionsCol.findOneAndUpdate(
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
  } catch (err){
    console.error(err.stack);

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message))
      return res.status(404).send({
      error: "Invalid Object ID"
    });

    return res.status(500).send({ error: "Server error" });
  }

  if (!newRolePermission) {
    return res.status(404).send({ error: "Role Permission not found" });
  }

  res.status(200).send({
    message: "delete",
    data: newRolePermission
  })
};

exports.manageRolePermissions = async (req, res) => {
  /* 
    Batch add and delete role permissions
    can only use existing roles and existing permissions
    to add new roles and new permissions, please use the 
    respective routes for each or the rolepermission post request
  */

  const rolePermissions = req.body;
  const add = rolePermissions.add;
  const remove = rolePermissions.remove;

  if (!add &&!remove) {
    return res.status(400).send({ error: "No role permissions to add or remove" });
  }

  let newDoc;
  if (add) {
    try{
      newDoc = await rolePermissionHelper.saveMultipleRolePermissions({rolePermissionData: {...add, company: rolePermissions.company}});
    } catch(err){
      console.error(err.stack);

      if (err.message.includes("role-permission combinations already exist")){
        return res.status(400).send({ error: err.message });
      }

      return res.status(500).send({ error: "Server error" });
    }
  } else if (remove){
    try{
      newDoc = await rolePermissionHelper.deleteMultipleRolePermissions({rolePermissionData: {remove: [...remove], company: rolePermissions.company}});
    } catch(err){
      console.error(err.stack);

      return res.status(500).send({ error: "Server error" });
    }
  }

  if(!newDoc){
    return res.status(404).send({ error: "No role permissions to add or remove"});
  }

  res.status(200).send({
    message: "manage role permissions",
    data: newDoc
  });
}