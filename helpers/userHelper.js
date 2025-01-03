const UsersCol = require("../models/users.js");
const bcrypt = require("bcrypt");
const utils = require("./utils.js");

exports.checkDuplicates = async function (newUser) {
  const email = newUser.email;
  const OID = newUser._id || newUser.OID;

  const duplicate = await UsersCol.findOne(
    { 
      email: email, 
      _id: { $ne: OID},
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

  if(data.OID)
    query._id = data.OID;
  else if(data.email) 
    query.email = data.email;

  const user = await utils.getAndPopulate({
    query: query,
    col: UsersCol,
  });

  return user[0];
}

exports.checkPassword = async ({data, oldPassword}) => {
  const user = await exports.checkUserExists(data);
  if (!user) 
    throw new Error("User not found");

  console.log(oldPassword)
  console.log(user.password)
  const correctPassword = await bcrypt.compare(oldPassword, user.password);

  // if (!correctPassword)
    // throw new Error('Incorrect password');

  return correctPassword;
}