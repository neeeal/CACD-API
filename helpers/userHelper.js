const UserCol = require("../models/users.js");
const bcrypt = require("bcrypt");

exports.checkDuplicates = async function (newUser) {
  const email = newUser.email;
  const oid = newUser._id || newUser.oid;

  const duplicate = await UserCol.findOne(
    { 
      email: email, 
      _id: { $ne: oid},
      deletedAt: null
    },
  )
  .select('email -_id')
  .lean();

  if (!duplicate)
    return null;

  if (duplicate.email !== email) 
    delete duplicate.email;

  const duplicateKeys = Object.keys(duplicate);
  return duplicateKeys;
}

exports.checkUserExists = async (data) => {
  const query = {deletedAt: null};

  if(data.email) 
    query.email = data.email;
  if(data.oid)
    query._id = data.oid;
  
  const user = await UserCol.findOne(query)
  .lean();

  return user;
}

exports.checkPassword = async (data) => {
  const user = await exports.checkUserExists(data);
  if (!user) 
    throw new Error("User not found");

  const correctPassword = bcrypt.compare(data.oldPassword, user.password);

  if (!correctPassword)
    throw new Error('Incorrect password');
}