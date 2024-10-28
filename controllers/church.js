const ChurchesCol = require("../models/churches.js");
const utils = require("../helpers/utils.js");
const moment = require("moment");

exports.get = async (req, res) => {
  const query = {
    deletedAt: null
  }
  
  const data = await ChurchesCol.find(query)
  .lean();

  res.status(200).send({
    message: "church get",
    data: data
  })
}

exports.post = async (req, res) => {
  const newChurch = req.body;

  const values = {
    name: newChurch.name,
    elders: newChurch.elders,
    location: newChurch.location,
    ministers: newChurch.ministers,
    contacts: newChurch.contacts,
    image: newChurch.image || null,
  };

  let data;
  try{
    const newChurchDoc = new ChurchesCol(values);
    data = await newChurchDoc.save();
  }
  catch (err){
    console.error(err.stack);
    return res.status(500).send({ message: "Server error" });
  }

  res.status(200).send({
    message: "church post",
    data: data
  })
}

exports.put = async (req, res) => {
  const newChurch = req.body;

  const values = {
    $set: {
      name: newChurch.name,
      elders: newChurch.elders,
      location: newChurch.location,
      ministers: newChurch.ministers,
      contacts: newChurch.contacts,
      image: newChurch.image || null,
    }
  };

  const query = {
    _id: newChurch.oid,
    deletedAt: null
  }

  const options = { 
    new: false
  }

  let data;
  try{
    data = await ChurchesCol.findOneAndUpdate(query, values, options)
    
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
    message: "church put",
    data: data
  })
}

exports.delete = async (req, res) => {
  const { oid } = req.params; 

  let churchDoc;
  try {
    churchDoc = await ChurchesCol.findOneAndUpdate(
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

  if (!churchDoc) {
    return res.status(404).send({ message: "Church not found" });
  }
  
  res.status(200).send({
    message: "Church deleted",
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

  const data = await ChurchesCol.findOne(query)
  .lean();

  if (!data) {
    return res.status(404).send({ message: "Church not found" });
  }

  res.status(200).send({
    message: "get church",
    data: data
  })
}