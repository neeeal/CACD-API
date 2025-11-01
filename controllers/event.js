const EventsCol = require("../models/events.js");
const utils = require("../helpers/utils.js");
const moment = require("moment");

// TODO: add unique eventID to events
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

exports.getOne = async (req, res) => {
  const params = req.params;

  let data;
  try{
    const query = { deletedAt: null, _id: params.event, company: params.company };

    data = await utils.getAndPopulate({
      query: query,
      col: EventsCol,
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
    message: "User get",
    data: data || [],
    count: data && data.length 
  })
}

exports.post = async (req, res) => {
  const newEvent = req.body;
  const photoFields = req.files; // multiple photos object of array of objects
  // const uploadedPhotos = photoFields.featuredPhoto[0];
  const uploadedPhotos = photoFields;

  // if (uploadedPhotos && uploadedPhotos.length) {
  //   try{
  //     const savedPhotos = await utils.saveMultiplePhotos({uploadedPhotos:uploadedPhotos, details:newEvent});
  //     newEvent.featuredPhoto = savedPhotos._id;
  //   }
  //   catch (err){
  //     console.error(err.stack);
  //     return res.status(500).send({ error: "Server error" });
  //   }
  // }
  console.log(newEvent);

  for (const ticket in newEvent.tickets){
    ticket.ticketId = utils.generateUUID()
  }
  console.log('newEvent');

  console.log(newEvent);

  if (uploadedPhotos && uploadedPhotos.length) {
    try{
      console.log("events post save")
      const savedPhotos = await utils.saveMultiplePhotos({uploadedPhotos:uploadedPhotos, details:newEvent});
      console.log(savedPhotos)
      // Only keep the first uploaded photo for an event
      newEvent.photos = Array.isArray(savedPhotos) ? savedPhotos.slice(0,1) : [savedPhotos];
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
    //   photo = await utils.saveMultiplePhotos({uploadedPhotos: uploadedPhotos, details: newEvent});

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
    // If new photos are uploaded, clear photos on the $set so the later photo management
    // will replace them entirely (avoid push/append behavior)
    if (uploadedPhotos && uploadedPhotos.length) {
      values.$set.photos = []
    }
    // previous logic for managing uploaded photos moved to manageMultiplePhotosUpdate
    newEvent = await utils.updateAndPopulate({ query: query, values: values, options: options, col: EventsCol });

    if (!newEvent) 
      throw new Error("Event not found");

  } catch(err){
    console.error(err.stack);

    if (err.message.includes("not found"))
      return res.status(404).send({ error: err.message });

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message))
      return res.status(404).send({
      error: "Invalid Object ID"
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

    console.log("FINISHED")
    console.log(data)
    console.log("FINISHED")

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
      error: "Invalid Object ID"
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
      error: "Invalid Object ID"
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

exports.getFeatured = async (req, res) => {
  let data;
  try{
    data = await EventsCol.find(
      {
        deletedAt: null,
        tags: { $in: ["Featured"]},
        dateEnd: {$gte: Date()}
      }
    )
    .sort({dateEnd: 1})
    .skip(req.query?.offset || 0)
    .limit(req.query?.limit || 1)
    .select("-deletedAt -__v -tickets.deletedAt")
    .populate({
      path: 'photos',
      select: 'title caption album metadata.location createdAt updatedAt',
      options: { limit: 1 }
    });

    console.log(moment().toISOString())
  }
  catch (err){
    console.error(err.stack);

    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "Featured events",
    data: data || [],
    count: data.length
  })
}