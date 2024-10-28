const TeamsCol = require("../models/teams.js");
const utils = require("../helpers/utils.js");
const moment = require("moment");

exports.get = async (req, res) => {

  const query = {
    deletedAt: null
  }
  
  const data = await TeamsCol.find(query)
  .lean();

  res.status(200).send({
    message: "team get",
    data: data
  })
}

exports.post = async (req, res) => {
  const newTeam = req.body;

  const values = {
    firstName: newTeam.firstName,
    lastName: newTeam.lastName,
    position: newTeam.position,
    description: newTeam.description,
    image: newTeam.image || null,
  }
  
  let data;
  try{
    const newTeamDoc = new TeamsCol(values);
    data = await newTeamDoc.save();
  }
  catch (err){
    console.error(err.stack);
    return res.status(500).send({ message: "Server error" });
  }

  res.status(200).send({
    message: "team post",
    data: data
  })
}


exports.put = async (req, res) => {
  const newTeam = req.body;

  const values = {
    $set: {
      firstName: newTeam.firstName,
      lastName: newTeam.lastName,
      position: newTeam.position,
      description: newTeam.description,
      image: newTeam.image || null,
    }
  }

  const query = {
    _id: newTeam.oid,
    deletedAt: null
  }

  const options = { 
    new: true 
  }

  let data;
  try{
    data = await TeamsCol.findOneAndUpdate(query, values, options)
    
    if (!data) 
      throw new Error("Team not found");

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
    message: "team put",
    data: data
  })
}

exports.delete = async (req, res) => {
  const { oid } = req.params; 

  let teamDoc;
  try {
    teamDoc = await TeamsCol.findOneAndUpdate(
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

  if (!teamDoc) {
    return res.status(404).send({ message: "Team not found" });
  }
  
  res.status(200).send({
    message: "Team deleted",
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

  const data = await TeamsCol.findOne(query)
  .lean();

  if (!data) {
    return res.status(404).send({ message: "Team not found" });
  }

  res.status(200).send({
    message: "get Team",
    data: data
  })
}