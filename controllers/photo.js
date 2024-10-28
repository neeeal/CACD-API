const path = require('path');
const fs = require('fs');
const PhotosCol = require("../models/photos.js");
const utils = require("../helpers/utils.js");
const moment = require("moment");

exports.get = async (req, res) => {
  try {
    const query = {
      deletedAt: null
    };

    // Fetch all photos
    const data = await PhotosCol.find(query).lean();

    // Map over the data to include the image URL for each photo
    const responseData = data.map(item => {
      return {
        ...item,
        imageUrl: utils.pathToURL(item.image.path) // Adjust path as necessary
      };
    });

    res.status(200).send({
      message: "Photos retrieved successfully",
      data: responseData
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error" });
  }
};

exports.post = async (req, res) => {
  const newPhoto = req.body;
  const image = req.file;
  
  if (!image) {
    return res.status(404).json({ message: 'No file uploaded' });
  }

  const values = {
    title: newPhoto.title || utils.removeExtension(image.originalname),
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
  const image = req.file;

  const values = {
    $set: {
      title: newPhoto.title || utils.removeExtension(image.originalname),
      caption: newPhoto.caption,
      image: image,
      eventOID: newPhoto.eventOID || null
    }
  }

  const query = {
    _id: newPhoto.oid,
    deletedAt: null
  }

  const options = { 
    new: true
  }

  let data;
  try{
    const oldData = await PhotosCol.findOne(query);
    data = await PhotosCol.findOneAndUpdate(query, values, options)
    if (!data) 
      throw new Error("Photo not found");
    if (oldData.image.originalname != data.image.originalname) {
      await utils.deleteImage(oldData.image.path);
      }
      else{
        await utils.deleteImage(data.image.path);
      }

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
    const absolutePath = path.join(__dirname, '..', data.image.path); // Adjust path as necessary
    // const absolutePath = path.join(process.env.IMAGEBASE_URI, data.image.path); // Adjust path as necessary
    // console.log(absolutePath);

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
          imageUrl: utils.pathToURL(absolutePath)
        }
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ message: "Server error" });
  }
}