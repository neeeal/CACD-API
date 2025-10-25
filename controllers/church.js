const ChurchesCol = require("../models/churches.js");
const utils = require("../helpers/utils.js");
const moment = require("moment");

// GET: /names/byCompany/:company
exports.getNamesByCompany = async (req, res) => {
  const params = req.params;
  try {
    const churches = await ChurchesCol.find({ deletedAt: null, company: params.company }).select('_id name');
    res.status(200).send({
      message: 'church names get',
      data: churches || [],
      count: churches.length
    });
  } catch (err) {
    console.error(err.stack);
    return res.status(500).send({ error: 'Server error' });
  }
};

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
      col: ChurchesCol,
      offset: queryParams.offset,
      limit: queryParams.limit
    })
  } catch (err) {
    console.error(err.stack);
    
    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message)){
      return res.status(404).send({ error: "Invalid ObjectId" });
    }

    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "church get",
    data: data || [],
    count: data && data.length
  })
}

exports.getOne = async (req, res) => {
  const params = req.params;

  let data;
  try{
    const query = { deletedAt: null, _id: params.church, company: params.company };

    data = await utils.getAndPopulate({
      query: query,
      col: ChurchesCol,
    });
    
  } catch (err) {
    console.error(err.stack);

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message)){
      return res.status(404).send({ error: "Invalid ObjectId" });
    }

    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "church get",
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
      col: ChurchesCol,
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
  const newChurch = req.body;
  // const photoFields = req.files; // multiple photos object of array of objects
  // const uploadedPhotos = photoFields.featuredPhoto[0];
  const uploadedPhotos = req.files;

  console.log(uploadedPhotos)
  // if (uploadedPhotos && uploadedPhotos.length) {
  //   try{
  //     const savedPhotos = await utils.saveMultiplePhotos({uploadedPhotos:uploadedPhotos, details:newChurch});
  //     newChurch.photo = savedPhotos._id;
  //   }
  //   catch (err){
  //     console.error(err.stack);
  //     return res.status(500).send({ error: "Server error" });
  //   }
  // }

  if (uploadedPhotos && uploadedPhotos.length) {
    try{
      const savedPhotos = await utils.saveMultiplePhotos({uploadedPhotos:uploadedPhotos, details:newChurch});
      newChurch.photos = savedPhotos;
    }
    catch (err){
      console.error(err.stack);
      return res.status(500).send({ error: "Server error" });
    }
  }

  const values = {
    name: newChurch.name,
    elders: newChurch.elders,
    location: newChurch.location,
    ministers: newChurch.ministers,
    contacts: newChurch.contacts,
    // featuredPhoto: newChurch.photo || null,
    photos: newChurch.photos || [],
    company: req.user.company
  };

  let data;
  try{
    const newChurchDoc = new ChurchesCol(values);
    data = await utils.saveAndPopulate({doc:newChurchDoc, col:ChurchesCol});
  }
  catch (err){
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }

  console.log(data)

  res.status(200).send({
    message: "church post",
    data: data
  })
}

exports.put = async (req, res) => {
  let newChurch = req.body;
  const uploadedPhotos = req.files; // multiple photos object of array of objects
  // const uploadedPhotos = photoFields.featuredPhoto && photoFields.featuredPhoto[0];
  // const uploadedPhotos = photoFields.photos;
  
  // initialize photos
  // newChurch.photos = !newChurch.photos || [] ? [] : newChurch.photos;

  const query = {
    _id: newChurch.OID,
    deletedAt: null
  }

console.log("async")
console.log(uploadedPhotos)
console.log("async")
  // if (uploadedPhotos && uploadedPhotos.length) {
  //   try{
  //     const savedPhotos = await utils.saveMultiplePhotos({uploadedPhotos:uploadedPhotos, details:newChurch});
  //     newChurch.photo = savedPhotos._id;
  //   }
  //   catch (err){
  //     console.error(err.stack);
  //     return res.status(500).send({ error: "Server error" });
  //   }
  // }

  // if (uploadedPhotos && uploadedPhotos.length) {
  //   try{
  //     const savedPhotos = await utils.updatePhoto({uploadedPhotos:uploadedPhotos, details:newChurch});
  //     newChurch.photos = newChurch.photossavedPhotos.map((photo) => photo._id);
  //   }
  //   catch (err){
  //     console.error(err.stack);
  //     return res.status(500).send({ error: "Server error" });
  //   }
  // }

  try{
    // if (newEvent.deleteMulPhotos && Array.isArray(newEvent.deleteMulPhotos)){
    //   newEvent = await utils.SoftDeleteMultiplePhotos({doc: newEvent, col: EventsCol});
    // } else if (uploadedPhotos && uploadedPhotos.length) {
    //   newEvent = await utils.saveMultiplePhotos({uploadedPhotos: uploadedPhotos, details: newEvent});
    // }
    newChurch = await utils.manageMultiplePhotosUpdate({
      col: ChurchesCol,
      query: query,
      uploadedPhotos: uploadedPhotos,
      newDoc: newChurch
    });

    if (!newChurch) 
      throw new Error("Church not found");

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

  const values = {
    $set: {
      ...newChurch
    }
  };

  // const values = {
  //   $set: {
  //     name: newChurch.name,
  //     elders: newChurch.elders,
  //     location: newChurch.location,
  //     ministers: newChurch.ministers,
  //     contacts: newChurch.contacts,
  //     // featuredPhoto: newChurch.featuredPhoto || null,
  //     photos: newChurch.photos || [],
  //   }
  // };

  console.log(values)

  const options = { 
    new: true
  }

  let data;
  try{
    data = await utils.updateAndPopulate({ query: query, values: values, options: options, col: ChurchesCol });
    
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
    message: "church put",
    data: data
  })
}

exports.delete = async (req, res) => {
  const { OID } = req.params; 

  let churchDoc;
  try {
    churchDoc = await ChurchesCol.findOneAndUpdate(
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

  if (!churchDoc) {
    return res.status(404).send({ error: "Church not found" });
  }
  
  res.status(200).send({
    message: "Church deleted",
    data: {
      OID: OID
    }
  })
}