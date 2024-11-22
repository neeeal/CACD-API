const path = require('path');
const fs = require('fs');
const PhotosCol = require("../models/photos.js");
const utils = require("../helpers/utils.js");
const moment = require("moment");

exports.get = async (req, res) => {
  const queryParams = req.query || {};
  
  let data;
  try {
    const query = utils.queryBuilder({
      initialQuery: { deletedAt: null },
      queryParams: queryParams
    });

    data = await utils.getAndPopulate({
      query: query,
      col: PhotosCol,
      offset: queryParams.offset,
      limit: queryParams.limit
    });
  } catch (err) {
    console.error(err.stack);
    
    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message)){
      return res.status(404).send({ error: "Invalid ObjectId" });
    }

    return res.status(500).send({ error: "Server error" });
  }

    res.status(200).send({
      message: "Photos retrieved successfully",
      data: data || [],
      count: data && data.length
    });
};

exports.getOne = async (req, res) => {
  const params = req.params;

  let data;
  try{
    const query = { deletedAt: null, _id: params.photoOid, company: params.companyOid };

    data = await utils.getAndPopulate({
      query: query,
      col: PhotosCol,
    });
    
  } catch (err) {
    console.error(err.stack);

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message)){
      return res.status(404).send({ error: "Invalid ObjectId" });
    }

    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "Photos get",
    data: data?.[0] || [],
    count: data && data.length 
  })
}

exports.post = async (req, res) => {
  const details = req.body;
  const uploadedPhotos = req.file;
  
  if (!uploadedPhotos) {
    return res.status(404).json({ message: 'No file uploaded' });
  }

  let data; 
  try{
    data = await utils.savePhotos({uploadedPhotos:uploadedPhotos, details:details});
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
  const uploadedPhotos = req.files;
  console.log(uploadedPhotos)

  let data;
  try{
    // data = await utils.updatePhoto({uploadedPhotos:uploadedPhotos, details:details});
    data = await utils.manageMultiplePhotosUpdate({
      // col: EventsCol,
      // query: query,
      uploadedPhotos: uploadedPhotos,
      newDoc: details
    });

  } catch (err){
    console.error(err.stack);

    if (err.message.includes("not found"))
      return res.status(404).send({ error: err.message });

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message))
      return res.status(404).send({
      error: "Invalid Object ID"
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

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message))
      return res.status(404).send({
      error: "Invalid Object ID"
    });

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