const path = require('path');
const fs = require('fs');
const PhotosCol = require("../models/photos.js");
const utils = require("../helpers/utils.js");
const moment = require("moment");

exports.get = async (req, res) => {

  const query = {
    deletedAt: null
  }
  
  const data = await PhotosCol.find(query)
  .lean();

  res.status(200).send({
    message: "photo get",
    data: data
  })
}

exports.post = async (req, res) => {
  const newPhoto = req.body;
  const image = req.file;
  
  console.log(newPhoto);
  console.log(image);

  if (!image) {
    return res.status(404).json({ message: 'No file uploaded' });
  }

  const values = {
    title: newPhoto.title,
    caption: newPhoto.caption,
    image: image,
    eventOID: newPhoto.eventOID || null,
    // imageInfo: image,
  }
  
  let data;
  try{
    const newPhotoDoc = new PhotosCol(values);
    data = await newPhotoDoc.save();
  }
  catch (err){
    console.error(err.stack);
    return res.status(500).send({ message: "Server error" });
  }

  res.status(200).send({
    message: "photo post",
    data: data
  })
} 
exports.put = async (req, res) => {
  const newPhoto = req.body;

  const values = {
    $set: {
      title: newPhoto.title,
      caption: newPhoto.caption,
      image: newPhoto.image,
      eventOID: newPhoto.eventOID || null
    }
  }

  const query = {
    _id: newEvent.oid,
    deletedAt: null
  }

  const options = { 
    new: true 
  }

  let data;
  try{
    data = await PhotosCol.findOneAndUpdate(query, values, options)
    
    if (!data) 
      throw new Error("Photo not found");

  } catch (err){
    console.error(err.stack);

    if (err.message.includes("not found"))
      return res.status(404).send({ message: err.message });

    if (err.message.includes("Cast to ObjectId failed"))
      return res.status(404).send({
      message: "Invalid Object ID"
    });
    
    return res.status(500).send({ message: "Server error" });
  }

  res.status(200).send({
    message: "photo put",
    data: data
  })
}

exports.delete = async (req, res) => {
  const { oid } = req.params; 

  let photoDoc;
  try {
    photoDoc = await PhotosCol.findOneAndUpdate(
      { 
        _id: oid, 
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
    return res.status(500).send({ message: "Server error" });
  }

  if (!photoDoc) {
    return res.status(404).send({ message: "Photo not found" });
  }
  
  res.status(200).send({
    message: "Photo deleted",
    data: {
      oid: oid
    }
  })
}

// exports.getOne = async (req, res) => {
//   const {name, oid} = req.query;

//   const query = {deletedAt: null};
//   // TODO: Add name query

//   if (oid) {
//     if (!utils.isOID(oid)) {
//       return res.status(400).send({ message: "Invalid ObjectId" });
//     }
//     query._id = oid;
//   }
//   const data = await PhotosCol.findOne(query)
//   .lean();

//   if (!data) {
//     return res.status(404).send({ message: "Photo not found" });
//   }

//   // Assuming `data.imagePath` contains the path to the image
//   const imagePath = data.image.path; // Adjust based on your schema
//   const absolutePath = path.join(__dirname, '..', imagePath); // Adjust path as necessary
//   console.log(absolutePath)
//   // Check if the file exists before sending it
//   fs.access(absolutePath, fs.constants.F_OK, (err) => {
//     if (err) {
//       return res.status(404).send({ message: "Image file not found" });
//     }

//     // Set appropriate content type for the image
//     res.set('Content-Type', 'image/png'); // Change this based on the image type
//     res.sendFile(absolutePath);
//   });
// }

exports.getOne = async (req, res) => {
  const { name, oid } = req.query;

  const query = { deletedAt: null };

  if (oid) {
    if (!utils.isOID(oid)) {
      return res.status(400).send({ message: "Invalid ObjectId" });
    }
    query._id = oid;
  }

  try {
    const data = await PhotosCol.findOne(query).lean();

    if (!data) {
      return res.status(404).send({ message: "Photo not found" });
    }

    // Assuming `data.image.path` contains the relative path to the image
    const imagePath = data.image.path; // Adjust based on your schema
    const absolutePath = path.join(__dirname, '..', imagePath); // Adjust path as necessary
    console.log(absolutePath);

    // Check if the file exists
    fs.access(absolutePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).send({ message: "Image file not found" });
      }

      // Send data and image path in the response
      res.status(200).send({
        message: "Photo retrieved successfully",
        data: {
          ...data, // Include all fields of the data
          imageUrl: absolutePath // Adjust the path accordingly
        }
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Server error" });
  }
}