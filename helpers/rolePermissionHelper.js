const RolePermissionsCol = require("../models/rolePermissions.js");
const PermissionsCol = require("../models/permissions.js");
const RolesCol = require("../models/roles.js");
const utils = require("../helpers/utils.js");
const moment = require("moment");

exports.saveRole = async ({roleData}) =>{ // TODO: add application-side handling of duplicate roles and permissions when create
  newRoleDoc = new RolesCol(roleData);
  const savedDoc = await newRoleDoc.save();

  return newRoleDoc;
}

exports.savePermission = async ({permissionData}) =>{
  newPermissionDoc = new PermissionsCol(permissionData);
  const savedDoc = await newPermissionDoc.save();

  return newPermissionDoc;
}

exports.manageSaveRole = async ({roleData, returnIdOnly = false}) =>{
  const existingRole = await RolesCol.findOne({
    _id: roleData.OID,
    deletedAt: null,
    company: roleData.companyOid
  })
  .lean();

  if (existingRole){
    return existingRole;
  }

  throw new Error("Role does not exist. Please create a new role first.")

  // console.log(roleData)

  // const newRole = await exports.saveRole({roleData});
  // return returnIdOnly ? newRole._id : newRole;
}

exports.manageSavePermission = async ({permissionData, returnIdOnly = false}) =>{
  const existingPermission = await PermissionsCol.findOne({
    _id: permissionData?.OID,
    deletedAt: null,
    company: permissionData.companyOid
  })
  .lean();

  if (existingPermission){
    return existingPermission;
  }

  throw new Error("Permission does not exist. Please create a new permission first.")

  // const newPermission = await exports.savePermission({permissionData});
  // return returnIdOnly ? newPermission._id : newPermission;
}

exports.deleteRole = async ({OID, returnIdOnly = false}) =>{
  const existingRole = await RolesCol.findByIdAndUpdate(
    {_id: OID },
    { deletedAt: moment() },
    { new: true }
  );

  if (!existingRole){
    throw new Error("Role not found.");
  }

  return returnIdOnly? existingRole._id : existingRole;
}

exports.deletePermission = async ({OID, returnIdOnly = false}) =>{
  const existingPermission = await PermissionsCol.findByIdAndUpdate(
    { _id: OID },
    { deletedAt: moment() },
    { new: true }
  );

  if (!existingPermission){
    throw new Error("Permission not found.");
  }

  return returnIdOnly? existingPermission._id : existingPermission;
}

exports.deleteMultipleRolePermissions = async ({rolePermissionData, returnIdOnly = false}) => {
  console.log(rolePermissionData)
  const deletedDocuments = await RolePermissionsCol.updateMany(
    {
      _id: { $in: rolePermissionData.remove },
      company: rolePermissionData.companyOid,
      deletedAt: null
    },
    { deletedAt: moment() }
  );
  return deletedDocuments;
}

exports.saveMultipleRolePermissions = async ({ rolePermissionData, returnIdOnly = false }) => {
  // Fetch roles and permissions by name
  const roles = await RolesCol.find({
    deletedAt: null, 
    _id: { $in: rolePermissionData.role },
    company: rolePermissionData.companyOid
  });

  const permissions = await PermissionsCol.find({
    deletedAt: null, 
    _id: { $in: rolePermissionData.permission },
    company: rolePermissionData.companyOid
  });

  // Map roles and permissions to their IDs for easier lookup
  const roleMap = roles.reduce((acc, role) => {
    acc[role._id] = role;
    return acc;
  }, {});

  const permissionMap = permissions.reduce((acc, permission) => {
    acc[permission._id] = permission;
    return acc;
  }, {});

  const existingRolePermissions = await exports.checkExistingRolePermissions({companyOid: rolePermissionData.companyOid, roles: roles, permissions:permissions});

  // Create role-permission documents
  const rolePermissionDocuments = rolePermissionData.role.map((roleName, idx) => {
    const permissionName = rolePermissionData.permission[idx];

    if (!roleMap[roleName] || !permissionMap[permissionName]) {
      throw new Error(`Invalid role or permission: ${roleName}, ${permissionName}`);
    }

    const role = roleMap[roleName];
    const permission = permissionMap[permissionName];

    const values = {
      company: rolePermissionData.companyOid,
      role: role._id,
      permission: permission._id,
      name: exports.formatRolePermissionName({ role, permission })
    };

    return new RolePermissionsCol(values);
  });

  console.log(rolePermissionDocuments);

  // Save documents to the database
  const savedDocuments = await RolePermissionsCol.insertMany(rolePermissionDocuments);

  // Return either documents or their IDs based on returnIdOnly flag
  return returnIdOnly ? savedDocuments.map(doc => doc._id) : savedDocuments;
};

exports.formatRolePermissionName = ({role, permission}) => {
  return `${role.name} ${permission.name}`
}

exports.checkExistingRolePermissions = async ({company, roles, permissions}) => {

  console.log(company)
  console.log(roles)
  console.log(permissions)


  const existingRolePermissions = await RolePermissionsCol.find({
    company: company,
    role: { $in: roles.map(role => role._id) },
    permission: { $in: permissions.map(permission => permission._id) },
    deletedAt: null, // Ensure only active records are checked
  });

  console.log("existingRolePermissions")
  console.log(existingRolePermissions)
  console.log("existingRolePermissions")
  
  if (existingRolePermissions.length) {
    throw new Error('Some role-permission combinations already exist.');
  }

  return null
}


/*
  Update Functions might be unused
  Consider removing
*/ 
exports.updateRole = async ({permissionData}) => {
  const existingRole = await RolesCol.findByIdAndUpdate(
    permissionData._id,
    {
      $set: {
        name: permissionData.name,
        company: permissionData.companyOid
      }
    },
    { new: true }
  ).lean();
  return existingRole;
}

exports.updatePermission = async ({permissionData}) => {
  const existingPermission = await PermissionsCol.findByIdAndUpdate(
    permissionData._id,
    {
      $set: {
        name: permissionData.name,
        company: permissionData.companyOid
      }
    },
    { new: true }
  ).lean();
  return existingPermission;
}

exports.manageUpdateRole = async({roleData, returnIdOnly = false}) => {
  const updatedRole = await exports.updateRole({permissionData});

  if (!updatedRole){
    throw new Error("Role not found");
  }

  return returnIdOnly? updatedRole._id : updatedRole;
}

exports.manageUpdatePermission = async({permissionData, returnIdOnly = false}) => {
  const updatedPermission = await exports.updatePermission({permissionData});

  if (!updatedPermission){
    throw new Error("Permission not found");
  }

  return returnIdOnly? updatedPermission._id : updatedPermission;
}