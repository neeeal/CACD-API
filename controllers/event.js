const EventsCol = require("../models/events.js");
const utils = require("../helpers/utils.js");
const moment = require("moment");

exports.get = async (req, res) => {

  const query = {
    deletedAt: null
  }
  
  const data = await EventsCol.find(query)
  .lean();

  res.status(200).send({
    message: "event get",
    data: data
  })
}

exports.post = async (req, res) => {
  const newEvent = req.body;
  const photoFields = req.files; // multiple photos object of array of objects
  // const uploadedPhotos = photoFields.featuredPhoto[0];
  const uploadedPhotos = photoFields;

  // if (uploadedPhotos) {
  //   try{
  //     const savedPhotos = await utils.savePhotos({uploadedPhotos:uploadedPhotos, details:newEvent});
  //     newEvent.featuredPhoto = savedPhotos._id;
  //   }
  //   catch (err){
  //     console.error(err.stack);
  //     return res.status(500).send({ error: "Server error" });
  //   }
  // }

  if (uploadedPhotos) {
    try{
      console.log("events post save")
      const savedPhotos = await utils.saveMultiplePhotos({uploadedPhotos:uploadedPhotos, details:newEvent});
      console.log(savedPhotos)
      newEvent.photos = savedPhotos; //savedPhotos.map((photo) => photo._id);
    }
    catch (err){
      console.error(err.stack);
      return res.status(500).send({ error: "Server error" });
    }
  }
  
  const values = {
    title: newEvent.title,
    description: newEvent.description,
    start: utils.ISOToDate(newEvent.start),
    end: utils.ISOToDate(newEvent.end),
    hostChurchOID: newEvent.hostChurchOID,
    status: newEvent.status,
    location: newEvent.location,
    registerLink: newEvent.registerLink,
    // featuredPhoto: newEvent.featuredPhoto || null,
    photos: newEvent.photos || null
  }

  let data;
  try{
    // let photo;
    // if(uploadedPhotos) 
    //   photo = await utils.savePhotos({uploadedPhotos: uploadedPhotos, details: newEvent});

    // if (photo)
    //   values.featuredPhoto = photo._id;

    const newEventDoc = new EventsCol(values);
    data = await newEventDoc.save();
  }
  catch (err){
    console.error(err.stack);

    if (err.message.includes("not found"))
      return res.status(404).send({ error: err.message });

    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "event post",
    data: data
  })
}

exports.put = async (req, res) => {
  let newEvent = req.body;
  const uploadedPhotos = req.files; // multiple photos object of array of objects
  console.log("uploadedPhotos")
  console.log(uploadedPhotos)
  // const uploadedPhotos = photoFields.featuredPhoto && photoFields.featuredPhoto[0];
  // const uploadedPhotos = photoFields.photos;
  // newEvent.photos = !newEvent.photos || [] ? [] : newEvent.photos;

  // if (uploadedPhotos) {
  //   try{
  //     const savedPhotos = await utils.savePhotos({uploadedPhotos:uploadedPhotos, details:newEvent});
  //     newEvent.featuredPhoto = savedPhotos._id;
  //   }
  //   catch (err){
  //     console.error(err.stack);
  //     return res.status(500).send({ error: "Server error" });
  //   }
  // }

  // if (uploadedPhotos) {
  //   try{
  //     const savedPhotos = await utils.saveMultiplePhotos({uploadedPhotos:uploadedPhotos, details:newEvent});
  //     newEvent.photos = savedPhotos.map((photo) => photo._id);
  //   }
  //   catch (err){
  //     console.error(err.stack);
  //     return res.status(500).send({ error: "Server error" });
  //   }
  // }

  const query = {
    _id: newEvent.OID,
    deletedAt: null
  }

  try{
    newEvent = await utils.manageMultiplePhotosUpdate({
      col: EventsCol,
      query: query,
      uploadedPhotos: uploadedPhotos,
      newDoc: newEvent
    });
  } catch(err){
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }

  const values = {
    $set: {
      ...newEvent
    }
  };



  const options = { 
    new: false
  }

  let data;
  try{
    data = await EventsCol.findOneAndUpdate(query, values, options)

    // console.log(query)
    // console.log(values)
    // console.log(data)
    // let photo;
    // if(uploadedPhotos) 
    //   photo = await utils.updatePhoto({uploadedPhotos: uploadedPhotos, details: data});
    
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
    message: "event put",
    data: data
  })
}

exports.delete = async (req, res) => {
  const { OID } = req.params; 

  let eventDoc;
  try {
    eventDoc = await EventsCol.findOneAndUpdate(
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

  if (!eventDoc) {
    return res.status(404).send({ error: "Event not found" });
  }
  
  res.status(200).send({
    message: "Event deleted",
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

  const data = await EventsCol.findOne(query)
  .lean();

  if (!data) {
    return res.status(404).send({ error: "Event not found" });
  }

  res.status(200).send({
    message: "get Event",
    data: data
  })
}