const mongoose = require("mongoose");
const PhotosCol = require("../models/photos.js");
const moment = require("moment");
const path = require('path');
const fs = require('fs');

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

exports.deletePhoto = async (originalPath) => {
  // const photoPath = path.join(__dirname, "..", originalPath);
  const photoPath = originalPath;
  console.log(photoPath)
  await fs.promises.unlink(photoPath);
  console.log("photo deleted successfully.");
  return;
}

exports.ISOToDate = (iso) => {
  console.log(iso)
  return moment(iso).toDate();
}

exports.dateToISO = (date) => {
  return moment(date).toISOString();
}

exports.savePhoto = async ({uploadedPhoto, details}) => {
  console.log(uploadedPhoto)
  const values = {
    ...uploadedPhoto,
    title: details.title || exports.removeExtension(uploadedPhoto.originalname),
    caption: details.caption,
    eventOID: details.eventOID || null,
    // photoInfo: photo,
  }
  
  const newPhotoDoc = new PhotosCol(values);
  const data = await newPhotoDoc.save();

  return newPhotoDoc;
}


exports.savePhotos = async ({uploadedPhotos, details}) => {
  if (!uploadedPhotos || uploadedPhotos.length === 0) {
    throw new Error("No photos to upload");
  }

  // Map over uploadedPhotos to create an array of photo documents
  const photoDocuments = uploadedPhotos.map((uploadedPhoto,idx) => {
    const values = {
      ...uploadedPhoto,
      title: exports.removeExtension(uploadedPhoto.originalname),
      // title: details[idx].title || exports.removeExtension(uploadedPhoto.originalname),
      // caption: details[idx].caption,
      // eventOID: details[idx].eventOID || null,
      // photoInfo: photo,
    }
    
    const newPhotoDoc = new PhotosCol(values);
    return newPhotoDoc;
  });

  // const values = {
  //   ...uploadedPhotos,
  //   title: exports.removeExtension(uploadedPhotos.originalname),
  //   eventOID: details.eventOID || null,
  //   // photoInfo: photo,
  // }
  
  const savedPhotos = await PhotosCol.insertMany(photoDocuments);
  return photoDocuments; // Return saved documents
}

exports.updatePhoto = async ({uploadedPhoto, details}) => {
  console.log(details)
  console.log(uploadedPhoto)
  const values = {
    $set: {
      ...uploadedPhoto,
      title: details.title || exports.removeExtension(uploadedPhoto.originalname),
      caption: details.caption,
      eventOID: details.eventOID || null
    }
  }

  const query = {
    _id: details.OID || // Photo route update
    details.featuredPhoto || // event route update
    details.photo, // team route update
    deletedAt: null
  }

  const options = { 
    new: true
  }

  const oldData = await PhotosCol.findOne(query);
  const data = await PhotosCol.findOneAndUpdate(query, values, options)
  console.log(query)
  console.log(oldData)
  console.log(data)

  if (!data) 
    throw new Error("Photo not found");

  if (oldData.originalname != data.originalname) {
    await exports.deletePhoto(oldData.path);
  }
  else{
    await exports.deletePhoto(data.path);
  }

  return data;
}

exports.updatePhotoEvent = async ({photo, event}) => {
  const query = {
    deletedAt: null,
    _id: photo._id
  }

  const values = {
    $set: {
      eventOID: event._id
    }
  }

  const options = { 
    new: true
  }

  const data = await PhotosCol.findOneAndUpdate(query, values, options);

  if (!data)
    throw new Error("Photo not found");

  return data;
}