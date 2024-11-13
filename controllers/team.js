const TeamsCol = require("../models/teams.js");
const utils = require("../helpers/utils.js");
const moment = require("moment");

exports.get = async (req, res) => {

  const queryParams = req.query || {};

  const query = utils.queryBuilder({
    initialQuery: { deletedAt: null },
    queryParams: queryParams
  });

  let data;
  try{
    data = await utils.getAndPopulate({
      query: query,
      col: TeamsCol,
      offset: queryParams.offset,
      limit: queryParams.limit
    });
  } catch (err) {
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }


  res.status(200).send({
    message: "team get",
    data: data || [],
    count: data && data.length
  })
}

exports.post = async (req, res) => {
  const newTeam = req.body;
  const uploadedPhotos = req.file;

  console.log(uploadedPhotos)

  if (uploadedPhotos) {
    try{
      const savedPhotos = await utils.savePhotos({uploadedPhotos:uploadedPhotos, details:newTeam});
      newTeam.photos = savedPhotos._id;
    }
    catch (err){
      console.error(err.stack);
      return res.status(500).send({ error: "Server error" });
    }
  }

  const values = {
    ...newTeam,
    photos: newTeam.photos || [],
  }
  
  let data;
  try{
    const newTeamDoc = new TeamsCol(values);
    data = await utils.saveAndPopulate({doc:newTeamDoc, col:TeamsCol});
  }
  catch (err){
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "team post",
    data: data
  })
}


exports.put = async (req, res) => {
  let newTeam = req.body;
  const uploadedPhotos = req.file;

  const query = {
    _id: newTeam.OID,
    deletedAt: null
  }

  try{
    newTeam = await utils.managePhotosUpdate({
      col: TeamsCol,
      query: query,
      uploadedPhotos: uploadedPhotos,
      newDoc: newTeam
    });
  } catch(err){
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }

  const values = {
    $set: {
      ...newTeam
    }
  }

  const options = { 
    new: true
  }

  try{
    newTeam = await utils.updateAndPopulate({ query: query, values: values, options: options, col: TeamsCol });
    
    if (!newTeam) 
      throw new Error("Team not found");

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
    message: "team put",
    data: newTeam
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
    return res.status(500).send({ error: "Server error" });
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

  let data;
  try{
    const data = await utils.getAndPopulate({
    query: query,
    col: TeamsCol,
  });
  } catch (err) {
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
}

  if (!data) {
    return res.status(404).send({ error: "Team not found" });
  }

  res.status(200).send({
    message: "get Team",
    data: data
  })
}