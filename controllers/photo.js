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
    const data = await PhotosCol.find(query);

    // // Map over the data to include the photo URL for each photo
    // const responseData = data.map(item => {
    //   return {
    //     ...item,
    //     photoUrl: utils.pathToURL(item.path) // Adjust path as necessary
    //   };
    // });

    res.status(200).send({
      message: "Photos retrieved successfully",
      data: data
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Server error" });
  }
};

exports.post = async (req, res) => {
  const details = req.body;
  const uploadedPhoto = req.file;
  
  if (!uploadedPhoto) {
    return res.status(404).json({ message: 'No file uploaded' });
  }

  let data; 
  try{
    data = await utils.savePhoto({uploadedPhoto:uploadedPhoto, details:details});
  }
  catch (err){
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "photo post",
    data: data
  })
} 
exports.put = async (req, res) => {
  const details = req.body;
  const uploadedPhoto = req.file;

  let data;
  try{
    data = await utils.updatePhoto({uploadedPhoto:uploadedPhoto, details:details});

  } catch (err){
    console.error(err.stack);

    if (err.message.includes("not found"))
      return res.status(404).send({ error: err.message });

    if (err.message.includes("Cast to ObjectId failed"))
      return res.status(404).send({
      message: "Invalid Object ID"
    });
    
    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "photo put",
    data: data
  })
}

exports.delete = async (req, res) => {
  const { OID } = req.params; 

  let photoDoc;
  try {
    photoDoc = await PhotosCol.findOneAndUpdate(
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

  if (!photoDoc) {
    return res.status(404).send({ error: "Photo not found" });
  }
  
  res.status(200).send({
    message: "Photo deleted",
    data: {
      OID: OID
    }
  })
}

exports.getOne = async (req, res) => {
  const { name, OID } = req.query;

  const query = { deletedAt: null };

  if (OID) {
    if (!utils.isOID(OID)) {
      return res.status(400).send({ error: "Invalid ObjectId" });
    }
    query._id = OID;
  }

  try {
    const data = await PhotosCol.findOne(query);
    console.log(data)

    if (!data) {
      return res.status(404).send({ error: "Photo not found" });
    }

    // Assuming `data.Photo.path` contains the relative path to the Photo
    // const absolutePath = path.join(__dirname, '..', data.path); // Adjust path as necessary
    // const absolutePath = path.join(process.env.IMAGEBASE_URI, data.photo.path); // Adjust path as necessary
    const absolutePath = data.path; // Adjust path as necessary
    // console.log(absolutePath);

    // Check if the file exists
    fs.access(absolutePath, fs.constants.F_OK, (err) => {
      if (err) {
        return res.status(404).send({ error: "Photo file not found" });
      }

      // Send data and Photo path in the response
      res.status(200).send({
        message: "Photo retrieved successfully",
        data: data
        // {
        //   ...data, // Include all fields of the data
        //   photoUrl: utils.pathToURL(absolutePath)
        // }
      });
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send({ error: "Server error" });
  }
}