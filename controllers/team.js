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
  const uploadedPhoto = req.file;

  console.log(uploadedPhoto)

  if (uploadedPhoto) {
    try{
      const savedPhoto = await utils.savePhoto({uploadedPhoto:uploadedPhoto, details:newTeam});
      newTeam.photos = savedPhoto._id;
    }
    catch (err){
      console.error(err.stack);
      return res.status(500).send({ message: "Server error" });
    }
  }

  const values = {
    firstName: newTeam.firstName,
    lastName: newTeam.lastName,
    position: newTeam.position,
    description: newTeam.description,
    photos: newTeam.photos || null,
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
  const uploadedPhoto = req.file;

  const values = {
    $set: {
      firstName: newTeam.firstName,
      lastName: newTeam.lastName,
      position: newTeam.position,
      description: newTeam.description,
    }
  }

  if (uploadedPhoto) {
    try{
      const oldPhotoOID = await TeamsCol
      .findOne(query)
      .select("photos")
      .populate("photos")
      .lean();
      newTeam.photos = oldPhotoOID.photos._id;
      const savedPhoto = await utils.updatePhoto({uploadedPhoto:uploadedPhoto, details:newUser});
      values.$set.photos = savedPhoto._id;
    }
    catch (err){
      console.error(err.stack);
      return res.status(500).send({ message: "Server error" });
    }
  }

  const query = {
    _id: newTeam.OID,
    deletedAt: null
  }

  const options = { 
    new: false
  }

  let data;
  try{
    data = await TeamsCol.findOneAndUpdate(query, values, options);
    
    if (!data) 
      throw new Error("Team not found");

  } catch (err){
    console.error(err.stack);

    if (err.message.includes("not found"))
      return res.status(404).send({ error: err.message });

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
  const { OID } = req.params; 

  let teamDoc;
  try {
    teamDoc = await TeamsCol.findOneAndUpdate(
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

  if (!teamDoc) {
    return res.status(404).send({ error: "Team not found" });
  }
  
  res.status(200).send({
    message: "Team deleted",
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

  const data = await TeamsCol.findOne(query)
  .lean();

  if (!data) {
    return res.status(404).send({ error: "Team not found" });
  }

  res.status(200).send({
    message: "get Team",
    data: data
  })
}