const PermissionsCol = require("../models/permissions.js");
const utils = require("../helpers/utils.js");
const moment = require("moment");

exports.get = async (req, res) => {
  const queryParams = req.query || {};

  const query = utils.queryBuilder({
    initialQuery: { deletedAt: null },
    queryParams: queryParams,
  });

  let data;
  try{
    data = await utils.getAndPopulate({
      query: query,
      col: PermissionsCol,
      offset: queryParams.offset,
      limit: queryParams.limit
    });
  } catch (err) {
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "get all active permissions",
    data: data || [],
    count: data && data.length
  })
};

exports.post = async (req, res) => {
  let newPermission = req.body;

  console.log(newPermission);

  let newPermissionDoc;
  try {
    newPermissionDoc = new PermissionsCol(newPermission);
    const savedDoc = await newPermissionDoc.save();
  } catch (err) {
    console.error(err.stack);

    // Check if the error is a duplicate key error
    if (err.name === 'MongoServerError' && err.code === 11000) {
      return res.status(400).send({
        error: "Duplicate key error. A permission with this name already exists.",
      });
    }

    // General server error response
    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "post",
    data: newPermissionDoc
  });
};


exports.put = async (req, res) => {
  let newPermission = req.body;

  const query = {
    _id: newPermission.OID,
    deletedAt: null
  };

  const values = {
    $set: {
      ...newPermission
    }
  };

  const options = { new: true };

  try {
    newRole = await utils.updateAndPopulate({ query: query, values: values, options: options, col: PermissionsCol });

    if (!newRole) 
      throw new Error("Permission not found");

  } catch (err) {
    console.error(err.stack);

    // Handle "Permission not found" error
    if (err.message.includes("not found")) {
      return res.status(404).send({ error: err.message });
    }

    // Handle invalid Object ID error
    if (err.message.includes("Cast to ObjectId failed")) {
      return res.status(400).send({ message: "Invalid Object ID" });
    }

    // Handle duplicate key error (MongoServerError with code 11000)
    if (err.code === 11000) {
      return res.status(400).send({
        error: `Duplicate key error. A permission with this ${Object.keys(err.keyValue).join(', ')} already exists.`,
      });
    }

    // General server error
    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "put",
    data: newRole
  });
};


exports.delete = async (req, res) => {
  
  const { OID } = req.params; 

  let newPermission;
  try {
    newPermission = await PermissionsCol.findOneAndUpdate(
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
    return res.status(500).send({ error: "Server error" });
  }

  if (!newPermission) {
    return res.status(404).send({ error: "Role not found" });
  }

  res.status(200).send({
    message: "get",
    data: newPermission
  })
};