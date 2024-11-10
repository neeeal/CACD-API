const AlbumsCol = require("../models/albums.js");
const PhotosCol = require("../models/photos.js");
const utils = require("../helpers/utils.js");
const moment = require("moment");


exports.get = async (req, res) => {
  const queryParams = req.query || {};

  const query = {
    deletedAt: null
  }
  
  if (queryParams.OID) {
    if (!utils.isOID(queryParams.OID)) {
      return res.status(400).send({ error: "Invalid ObjectId" });
    }
    query._id = queryParams.OID;
  }

  let data;
  try{
    data = await utils.getAndPopulate({
      query: query,
      col: AlbumsCol,
      offset: queryParams.offset,
      limit: queryParams.limit
    })
  } catch (err) {
    console.error(err.stack);
    res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "church get",
    data: data,
    count: data.length
  })
}

exports.post = async (req, res) => {
  let newAlbum = req.body;

  try{
    newAlbum = new AlbumsCol(newAlbum);
    await newAlbum.save();
  } catch (err) {
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "post",
    data: newAlbum 
  });
}

exports.put = async (req, res) => {
  let newAlbum = req.body;

  const query = {
    _id: newAlbum.OID,
    deletedAt: null
  };

  const values = {
    $set: {
      ...newAlbum
    }
  };

  const options = { new: true };

  try{
    newAlbum = await AlbumsCol.findOneAndUpdate(query, values, options);

    if (!newAlbum) 
      throw new Error("Album not found");

  } catch(err){
    console.error(err.stack);

    if (err.message.includes("not found"))
      return res.status(404).send({ error: err.message });

    if (err.message.includes("Cast to ObjectId failed"))
      return res.status(404).send({
      message: "Invalid Object ID"
    }); 
  }

  res.status(200).send({
    message: "put",
    data: newAlbum 
  });
}

exports.delete = async (req, res) => {
  
  const { OID } = req.params; 

  let albumDoc;
  try {
    albumDoc = await AlbumsCol.findOneAndUpdate(
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

  if (!albumDoc) {
    return res.status(404).send({ error: "Church not found" });
  }
  
  res.status(200).send({
    message: "delete",
    data: albumDoc 
  });
}

exports.addPhotosToAlbum = async (req, res) => {

}

exports.removePhotosFromAlbum = async (req, res) => {
  
}