const AlbumsCol = require("../models/albums.js");
const PhotosCol = require("../models/photos.js");
const utils = require("../helpers/utils.js");
const moment = require("moment");
const Album = require("../models/albums.js");

const getAlbumPhotos = async ( {company, album} ) => {
  const query = {
    company: company,
    album: album,
    deletedAt: null
  }

  const albumPhotos = await PhotosCol.find(query).sort({ deletedAt: -1 });

  return albumPhotos;
}

/**
 * Maps photos to their corresponding albums.
 * @param {Array} albums - Array of album documents.
 * @returns {Promise<Array>} - Albums with their photos populated.
 */
const mapPhotosToAlbums = async (albums) => {
  if (!albums || albums.length === 0) {
      return albums;
  }

  const albumPhotoPromises = albums.map(async (album) => {
      const albumPhotos = await getAlbumPhotos({
          company: album.company,
          album: album._id, // Match photos by album ID
      });

      // Add the photos to the album object
      return {
          ...album.toObject(),
          photos: albumPhotos,
      };
  });

  // Resolve all album-photo mappings
  return Promise.all(albumPhotoPromises);
};

exports.get = async (req, res) => {
  const queryParams = req.query || {};

  let data;
  try {
      // Build the query for albums
      const query = utils.queryBuilder({
          initialQuery: { deletedAt: null },
          queryParams: queryParams,
      });

      // Fetch albums with pagination
      data = await utils.getAndPopulate({
          query: query,
          col: AlbumsCol,
          offset: queryParams.offset,
          limit: queryParams.limit,
      });

      // Map photos to albums
      data = await mapPhotosToAlbums(data);
  } catch (err) {
      console.error(err.stack);

      if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message)) {
          return res.status(404).send({ error: "Invalid ObjectId" });
      }

      return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
      message: "Church get",
      data: data || [],
      count: data && data.length,
  });
};

exports.getOne = async (req, res) => {
  const params = req.params;

  let data;
  try{
    const query = { deletedAt: null, _id: params.album, company: params.company };

    data = await utils.getAndPopulate({
      query: query,
      col: AlbumsCol,
    });
    
    // Map photos to albums
    data = await mapPhotosToAlbums(data);

  } catch (err) {
    console.error(err.stack);

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message)){
      return res.status(404).send({ error: "Invalid ObjectId" });
    }

    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "album get",
    data: data?.[0] || [],
    count: data && data.length 
  })
}

exports.getByCompany = async (req, res) => {
  
  const queryParams = req.query || {};
  const params = req.params;

  let data;
  try{
    const query = utils.queryBuilder({
      initialQuery: { deletedAt: null, company: params.company },
      queryParams: queryParams,
    });

    data = await utils.getAndPopulate({
      query: query,
      col: AlbumsCol,
      offset: queryParams.offset,
      limit: queryParams.limit
    });

    // Map photos to albums
    data = await mapPhotosToAlbums(data);

  } catch (err) {
    console.error(err.stack);

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message)){
      return res.status(404).send({ error: "Invalid ObjectId" });
    }

    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "User get",
    data: data || [],
    count: data && data.length 
  })
}

exports.post = async (req, res) => {
  let newAlbum = req.body;

  try{
    newAlbum = new AlbumsCol(newAlbum);
    newAlbum = await utils.saveAndPopulate({doc:newAlbum, col:AlbumsCol});
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

  console.log("newAlbum");
  console.log(newAlbum);
  console.log("newAlbum");

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
    newAlbum = await utils.updateAndPopulate({ query: query, values: values, options: options, col: AlbumsCol });

    if (!newAlbum) 
      throw new Error("Album not found");

  } catch(err){
    console.error(err.stack);

    if (err.message.includes("not found"))
      return res.status(404).send({ error: err.message });

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message))
      return res.status(404).send({
      error: "Invalid Object ID"
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

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message))
      return res.status(404).send({
      error: "Invalid Object ID"
    });

    return res.status(500).send({ error: "Server error" });
  }

  if (!albumDoc) {
    return res.status(404).send({ error: "Album not found" });
  }
  
  res.status(200).send({
    message: "delete",
    data: albumDoc 
  });
}

exports.manageAlbumPhotos = async (req, res) => {
  let newDoc = req.body;
  const uploadedPhotos = req.files || {};

  if (
    (uploadedPhotos && Object.keys(uploadedPhotos).length) ||
    (newDoc.add && newDoc.add)
  ){
    const addQuery = {
      _id: {$in: newDoc.add || []},
      deletedAt: null
    };


    const addValues = {
        album: newDoc.OID
    };

    try{
      const data = await utils.saveMultiplePhotos({uploadedPhotos:uploadedPhotos, details:newDoc});

      if (data){
        addQuery._id.$in = [
          ...addQuery._id.$in, ...data
        ]
      }

      newDoc = await PhotosCol.updateMany(addQuery, addValues);
    } catch(err){
      console.error(err.stack);
      return res.status(500).send({ error: "Server error" });
    }
  }
  else if (newDoc.remove && newDoc.remove.length){
    const removeQuery = {
      _id: {$in: newDoc.remove},
      deletedAt: null
    };

    const removeValues = {
      $set: {
        album: null
      }
    };

    try{
      newDoc = await PhotosCol.updateMany(removeQuery, removeValues);
    } catch(err){
      console.error(err.stack);
      return res.status(500).send({ error: "Server error" });
    }
  }

  return res.status(200).send({
    message: "manageAlbumPhotos",
    data: newDoc
  });
}