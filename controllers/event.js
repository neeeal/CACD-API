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

  const values = {
    title: newEvent.title,
    description: newEvent.description,
    start: newEvent.start,
    end: newEvent.end,
    hostChurch: newEvent.hostChurch,
    status: newEvent.status,
    location: newEvent.location,
    registerLink: newEvent.registerLink
  }
  
  let data;
  try{
    const newEventDoc = new EventsCol(values);
    data = await newEventDoc.save();
  }
  catch (err){
    console.error(err.stack);
    return res.status(500).send({ message: "Server error" });
  }

  res.status(200).send({
    message: "event post",
    data: data
  })
}

exports.put = async (req, res) => {
  const newEvent = req.body;

  const values = {
    $set: {
      title: newEvent.title,
      description: newEvent.description,
      start: newEvent.start,
      end: newEvent.end,
      hostChurch: newEvent.hostChurch,
      status: newEvent.status,
      location: newEvent.location,
      registerLink: newEvent.registerLink,
      image: newEvent.image || null,
    }
  };

  const query = {
    _id: newEvent.oid,
    deletedAt: null
  }

  const options = { 
    new: true 
  }

  let data;
  try{
    data = await EventsCol.findOneAndUpdate(query, values, options)
    
    if (!data) 
      throw new Error("Event not found");

  } catch (err){
    console.error(err.stack);

    if (err.message.includes("not found"))
      return res.status(404).send({ message: err.message });

    return res.status(500).send({ message: "Server error" });
  }

  res.status(200).send({
    message: "event put",
    data: data
  })
}

exports.delete = async (req, res) => {
  const { oid } = req.params; 

  let eventDoc;
  try {
    eventDoc = await EventsCol.findOneAndUpdate(
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

  if (!eventDoc) {
    return res.status(404).send({ message: "Event not found" });
  }
  
  res.status(200).send({
    message: "Event deleted",
    data: {
      oid: oid
    }
  })
}

exports.getOne = async (req, res) => {
  const {name, oid} = req.query;

  const query = {deletedAt: null};
  // TODO: Add name query

  if (oid) {
    if (!utils.isOID(oid)) {
      return res.status(400).send({ message: "Invalid ObjectId" });
    }
    query._id = oid;
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