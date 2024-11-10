const ChurchesCol = require("../models/churches.js");
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
      col: ChurchesCol,
      offset: queryParams.offset,
      limit: queryParams.limit
    })
  } catch (err) {
    console.error(err.stack);
    res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "church get",
    data: data || [],
    count: data.length
  })
}

exports.post = async (req, res) => {
  const newChurch = req.body;
  // const photoFields = req.files; // multiple photos object of array of objects
  // const uploadedPhotos = photoFields.featuredPhoto[0];
  const uploadedPhotos = req.files;

  // if (uploadedPhotos) {
  //   try{
  //     const savedPhotos = await utils.savePhotos({uploadedPhotos:uploadedPhotos, details:newChurch});
  //     newChurch.photo = savedPhotos._id;
  //   }
  //   catch (err){
  //     console.error(err.stack);
  //     return res.status(500).send({ error: "Server error" });
  //   }
  // }

  if (uploadedPhotos) {
    try{
      const savedPhotos = await utils.saveMultiplePhotos({uploadedPhotos:uploadedPhotos, doc:newChurch});
      newChurch.photos = savedPhotos.map((photo) => photo._id);
    }
    catch (err){
      console.error(err.stack);
      return res.status(500).send({ error: "Server error" });
    }
  }

  const values = {
    name: newChurch.name,
    elders: newChurch.elders,
    location: newChurch.location,
    ministers: newChurch.ministers,
    contacts: newChurch.contacts,
    // featuredPhoto: newChurch.photo || null,
    photos: newChurch.photos || [],
  };

  let data;
  try{
    const newChurchDoc = new ChurchesCol(values);
    data = await utils.saveAndPopulate(newChurchDoc);
  }
  catch (err){
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }

  console.log(data)

  res.status(200).send({
    message: "church post",
    data: data
  })
}

exports.put = async (req, res) => {
  let newChurch = req.body;
  const uploadedPhotos = req.files; // multiple photos object of array of objects
  // const uploadedPhotos = photoFields.featuredPhoto && photoFields.featuredPhoto[0];
  // const uploadedPhotos = photoFields.photos;
  
  // initialize photos
  // newChurch.photos = !newChurch.photos || [] ? [] : newChurch.photos;

  const query = {
    _id: newChurch.OID,
    deletedAt: null
  }

console.log("async")
console.log(uploadedPhotos)
console.log("async")
  // if (uploadedPhotos) {
  //   try{
  //     const savedPhotos = await utils.savePhotos({uploadedPhotos:uploadedPhotos, details:newChurch});
  //     newChurch.photo = savedPhotos._id;
  //   }
  //   catch (err){
  //     console.error(err.stack);
  //     return res.status(500).send({ error: "Server error" });
  //   }
  // }

  // if (uploadedPhotos) {
  //   try{
  //     const savedPhotos = await utils.updatePhoto({uploadedPhotos:uploadedPhotos, details:newChurch});
  //     newChurch.photos = newChurch.photossavedPhotos.map((photo) => photo._id);
  //   }
  //   catch (err){
  //     console.error(err.stack);
  //     return res.status(500).send({ error: "Server error" });
  //   }
  // }

  try{
    // if (newEvent.deleteMulPhotos && Array.isArray(newEvent.deleteMulPhotos)){
    //   newEvent = await utils.SoftDeleteMultiplePhotos({doc: newEvent, col: EventsCol});
    // } else if (uploadedPhotos) {
    //   newEvent = await utils.saveMultiplePhotos({uploadedPhotos: uploadedPhotos, details: newEvent});
    // }
    newChurch = await utils.manageMultiplePhotosUpdate({
      col: ChurchesCol,
      query: query,
      uploadedPhotos: uploadedPhotos,
      newDoc: newChurch
    });

    if (!newChurch) 
      throw new Error("Church not found");

  } catch(err){
    console.error(err.stack);

    if (err.message.includes("not found"))
      return res.status(404).send({ error: err.message });

    if (err.message.includes("Cast to ObjectId failed"))
      return res.status(404).send({
      message: "Invalid Object ID"
    });

    return res.status(500).send({ error: "Server error" });
  }

  const values = {
    $set: {
      ...newChurch
    }
  };

  // const values = {
  //   $set: {
  //     name: newChurch.name,
  //     elders: newChurch.elders,
  //     location: newChurch.location,
  //     ministers: newChurch.ministers,
  //     contacts: newChurch.contacts,
  //     // featuredPhoto: newChurch.featuredPhoto || null,
  //     photos: newChurch.photos || [],
  //   }
  // };

  console.log(values)

  const options = { 
    new: true
  }

  let data;
  try{
    data = await utils.updateAndPopulate({ query: query, values: values, options: options, col: ChurchesCol });
    
    if (!data) 
      throw new Error("Event not found");
    
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
    message: "church put",
    data: data
  })
}

exports.delete = async (req, res) => {
  const { OID } = req.params; 

  let churchDoc;
  try {
    churchDoc = await ChurchesCol.findOneAndUpdate(
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

  if (!churchDoc) {
    return res.status(404).send({ error: "Church not found" });
  }
  
  res.status(200).send({
    message: "Church deleted",
    data: {
      OID: OID
    }
  })
}

exports.getOne = async (req, res) => {
  const {name, OID} = req.query;

  const query = {deletedAt: null};
  // TODO: Add name query

  if (OID) {
    if (!utils.isOID(OID)) {
      return res.status(400).send({ error: "Invalid ObjectId" });
    }
    query._id = OID;
  }

  let data;
  try{
    data = await utils.getAndPopulate({
    query: query,
    col: ChurchesCol,
  });
  } catch (err) {
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }

  if (!data) {
    return res.status(404).send({ error: "Church not found" });
  }

  res.status(200).send({
    message: "get church",
    data: data
  })
}