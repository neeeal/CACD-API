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
  const uploadedPhoto = req.file;

  const values = {
    title: newEvent.title,
    description: newEvent.description,
    start: utils.ISOToDate(newEvent.start),
    end: utils.ISOToDate(newEvent.end),
    hostChurchOID: newEvent.hostChurchOID,
    status: newEvent.status,
    location: newEvent.location,
    registerLink: newEvent.registerLink,
  }
  
  let data;
  try{
    let photo;
    if(uploadedPhoto) 
      photo = await utils.savePhoto({uploadedPhoto: uploadedPhoto, details: newEvent});

    if (photo)
      values.featuredPhoto = photo._id;

    const newEventDoc = new EventsCol(values);
    data = await newEventDoc.save();

    await utils.updatePhotoEvent({photo: photo, event: newEventDoc})
  }
  catch (err){
    console.error(err.stack);

    if (err.message.includes("not found"))
      return res.status(404).send({ message: err.message });

    return res.status(500).send({ message: "Server error" });
  }

  res.status(200).send({
    message: "event post",
    data: data
  })
}

exports.put = async (req, res) => {
  const newEvent = req.body;
  const uploadedPhoto = req.file;

  const values = {
    $set: {
      title: newEvent.title,
      description: newEvent.description,
      start: newEvent.start,
      end: newEvent.end,
      hostChurchOID: newEvent.hostChurchOID,
      status: newEvent.status,
      location: newEvent.location,
      registerLink: newEvent.registerLink,
    }
  };

  const query = {
    _id: newEvent.OID,
    deletedAt: null
  }

  const options = { 
    new: false
  }

  let data;
  try{
    data = await EventsCol.findOneAndUpdate(query, values, options)

    console.log(query)
    console.log(values)
    console.log(data)
    let photo;
    if(uploadedPhoto) 
      photo = await utils.updatePhoto({uploadedPhoto: uploadedPhoto, details: data});
    
    if (!data) 
      throw new Error("Event not found");

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
    return res.status(500).send({ message: "Server error" });
  }

  if (!eventDoc) {
    return res.status(404).send({ message: "Event not found" });
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
      return res.status(400).send({ message: "Invalid ObjectId" });
    }
    query._id = OID;
  }

  const data = await EventsCol.findOne(query)
  .lean();

  if (!data) {
    return res.status(404).send({ message: "Event not found" });
  }

  res.status(200).send({
    message: "get Event",
    data: data
  })
}