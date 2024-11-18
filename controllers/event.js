const EventsCol = require("../models/events.js");
const utils = require("../helpers/utils.js");
const moment = require("moment");

exports.get = async (req, res) => {
  const queryParams = req.query || {};
  
  let data;
  try{
    const query = utils.queryBuilder({
      initialQuery: { deletedAt: null },
      queryParams: queryParams
    });

    data = await utils.getAndPopulate({
      query: query,
      col: EventsCol,
      offset: queryParams.offset,
      limit: queryParams.limit
    });
  } catch (err) {
  console.error(err.stack);

  if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message)){
    return res.status(404).send({ error: "Invalid ObjectId" });
  }

  return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "event get",
    data: data || [],
    count: data && data.length
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
      const savedPhotos = await utils.saveMultiplePhotos({uploadedPhotos:uploadedPhotos, doc:newEvent});
      console.log(savedPhotos)
      newEvent.photos = savedPhotos; //savedPhotos.map((photo) => photo._id);
    }
    catch (err){
      console.error(err.stack);
      return res.status(500).send({ error: "Server error" });
    }
  }
  
  const values = {
    // name: newEvent.name,
    // description: newEvent.description,
    // date: utils.ISOToDate(newEvent.date),
    // dateEnd: utils.ISOToDate(newEvent.dateEnd),
    // hostChurchOID: newEvent.hostChurchOID,
    // status: newEvent.status,
    // location: newEvent.location,
    // registerLink: newEvent.registerLink,
    // // featuredPhoto: newEvent.featuredPhoto || null,
    ...newEvent,
    photos: newEvent.photos || []
  }

  let data;
  try{
    // let photo;
    // if(uploadedPhotos) 
    //   photo = await utils.savePhotos({uploadedPhotos: uploadedPhotos, details: newEvent});

    // if (photo)
    //   values.featuredPhoto = photo._id;

    const newEventDoc = new EventsCol(values);
    console.log("NOW")
    data = await utils.saveAndPopulate({doc:newEventDoc, col:EventsCol});
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

  const query = {
    _id: newEvent.OID,
    deletedAt: null
  }
  
  const values = {
    $set: {
      ...newEvent
    }
  };

  const options = { 
    new: true
  }

  try{
    // if (newEvent.deleteMulPhotos && Array.isArray(newEvent.deleteMulPhotos)){
    //   newEvent = await utils.SoftDeleteMultiplePhotos({doc: newEvent, col: EventsCol});
    // } else if (uploadedPhotos) {
    //   newEvent = await utils.saveMultiplePhotos({uploadedPhotos: uploadedPhotos, details: newEvent});
    // }
    newEvent = await utils.updateAndPopulate({ query: query, values: values, options: options, col: EventsCol });

    if (!newEvent) 
      throw new Error("Event not found");

  } catch(err){
    console.error(err.stack);

    if (err.message.includes("not found"))
      return res.status(404).send({ error: err.message });

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message))
      return res.status(404).send({
      message: "Invalid Object ID"
    });

    return res.status(500).send({ error: "Server error" });
  }

  let data;
  try{
    data = await utils.manageMultiplePhotosUpdate({
      col: EventsCol,
      query: query,
      uploadedPhotos: uploadedPhotos,
      newDoc: newEvent
    });

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

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message))
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

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message))
      return res.status(404).send({
      message: "Invalid Object ID"
    });
    
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