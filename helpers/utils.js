const mongoose = require("mongoose");

exports.isDuplicateKeyError = (errorMessage) => {
  const regex = /dup key: \{ (\w+):/;
  const match = errorMessage.match(regex);
  return match[1] || false;
}

exports.isOID = (OID) => {
  return mongoose.isValidObjectId(OID) ? OID : false;
}

// exports.stringToOID = (string) => {
//   return mongoose.Types.ObjectId.createFromHexString(string);
// }

exports.pathToURL = (path) => {
  return process.env.IMAGE_DEVURI + path.split('\\').pop() // Adjust the path accordingly
}

exports.removeExtension = (filename) => {
  const parts = filename.split(".");

  parts.pop();

  return parts.join(".");
}

exports.deleteImage = async (path) => {
  const imagePath = path.join(__dirname, "..", path);
  console.log(imagePath)
  await fs.promises.unlink(imagePath);
  console.log("image deleted successfully.");
  return;
}