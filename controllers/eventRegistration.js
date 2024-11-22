const EventRegistrationsCol = require("../models/eventRegistrations.js");
const utils = require("../helpers/utils.js");
const moment = require("moment");

exports.get = async (req, res) => {
  const queryParams = req.query || {};

  let data;
  try{
    const query = utils.queryBuilder({
      initialQuery: { deletedAt: null },
      queryParams: queryParams,
    });

    data = await utils.getAndPopulate({
      query: query,
      col: EventRegistrationsCol,
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
    message: "get all active event registrations",
    data: data || [],
    count: data && data.length
  })
};

exports.getOne = async (req, res) => {
  const queryParams = req.query || {};
  const { OID } = req.params;

  let data;
  try{
    const query = utils.queryBuilder({
      initialQuery: { deletedAt: null, _id: OID },
      queryParams: { company: queryParams?.company }
    });

    data = await utils.getAndPopulate({
      query: query,
      col: EventRegistrationsCol,
    });
    
  } catch (err) {
    console.error(err.stack);

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message)){
      return res.status(404).send({ error: "Invalid ObjectId" });
    }

    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "EventRegistrations get",
    data: data?.[0] || [],
    count: data && data.length 
  })
}

exports.post = async (req, res) => {
  let newEventRegistration = req.body;
  const uploadedPhotos = req.file;

  console.log(uploadedPhotos)

  if (uploadedPhotos) {
    try{
      const savedPhotos = await utils.savePhotos({uploadedPhotos:uploadedPhotos, details:newEventRegistration});
      newEventRegistration.photos = savedPhotos._id;
    }
    catch (err){
      console.error(err.stack);
      return res.status(500).send({ error: "Server error" });
    }
  }

  const values = {
    ...newEventRegistration,
  }

  console.log(values);
  console.log(req.body);
  let newEventRegistrationDoc;
  try {
    newEventRegistrationDoc = new EventRegistrationsCol(values);
    const savedDoc = await newEventRegistrationDoc.save();
  } catch (err) {
    console.error(err.stack);

    // Check if the error is a duplicate key error
    if (err.name === 'MongoServerError' && err.code === 11000) {
      return res.status(400).send({
        error: "Duplicate key error. A Event registration with this name already exists.",
      });
    }

    // General server error response
    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "post",
    data: newEventRegistrationDoc
  });
};


exports.put = async (req, res) => {
  let newEventRegistration = req.body;

  const query = {
    _id: newEventRegistration.OID,
    deletedAt: null
  };

  const values = {
    $set: {
      ...newEventRegistration,
    }
  };

  const options = { new: true };

  try {
    newEventRegistration = await utils.updateAndPopulate({ query: query, values: values, options: options, col: EventRegistrationsCol });

    if (!newEventRegistration) 
      throw new Error("Event registration not found");

  } catch (err) {
    console.error(err.stack);

    // Handle "Event registration not found" error
    if (err.message.includes("not found")) {
      return res.status(404).send({ error: err.message });
    }

    // Handle invalid Object ID error
    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message)) {
      return res.status(400).send({ error: "Invalid Object ID" });
    }

    // Handle duplicate key error (MongoServerError with code 11000)
    if (err.code === 11000) {
      return res.status(400).send({
        error: `Duplicate key error. A Event registration with this ${Object.keys(err.keyValue).join(', ')} already exists.`,
      });
    }

    // General server error
    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "put",
    data: newEventRegistration
  });
};


exports.delete = async (req, res) => {
  
  const { OID } = req.params; 

  let newEventRegistration;
  try {
    newEventRegistration = await EventRegistrationsCol.findOneAndUpdate(
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

  if (!newEventRegistration) {
    return res.status(404).send({ error: "Event registration not found" });
  }

  res.status(200).send({
    message: "get",
    data: newEventRegistration
  })
};