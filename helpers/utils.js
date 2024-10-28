const mongoose = require("mongoose");

exports.isDuplicateKeyError = (errorMessage) => {
  const regex = /dup key: \{ (\w+):/;
  const match = errorMessage.match(regex);
  return match[1] || false;
}

exports.isOID = (oid) => {
  return mongoose.isValidObjectId(oid) ? oid : false;
}

// exports.stringToOID = (string) => {
//   return mongoose.Types.ObjectId.createFromHexString(string);
// }