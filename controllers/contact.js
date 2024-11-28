const ContactsCol = require("../models/contacts.js");
const utils = require("../helpers/utils.js");
const moment = require("moment");

// TODO: add batch delete service

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
      col: ContactsCol,
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
    message: "contact get",
    data: data || [],
    count: data && data.length
  })
}

exports.getOne = async (req, res) => {
  const user = req.user;

  let data;
  try{
    const query = { deletedAt: null, _id: user.contact, company: user.company };

    data = await utils.getAndPopulate({
      query: query,
      col: ContactsCol,
    });
    
  } catch (err) {
    console.error(err.stack);

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message)){
      return res.status(404).send({ error: "Invalid ObjectId" });
    }

    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "Contacts get",
    data: data?.[0] || [],
    count: data && data.length 
  })
}

exports.getByCompany = async (req, res) => {
  
  const queryParams = req.query || {};
  const user = req.user;

  let data;
  try{
    const query = utils.queryBuilder({
      initialQuery: { deletedAt: null, company: user.company },
      queryParams: queryParams,
    });

    data = await utils.getAndPopulate({
      query: query,
      col: ContactsCol,
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
  const newContact = req.body;
  const uploadedPhotos = req.files;

  console.log(uploadedPhotos)

  if (uploadedPhotos) {
    try{
      const savedPhotos = await utils.saveMultiplePhotos({uploadedPhotos:uploadedPhotos, details:newContact});
      newContact.photos = savedPhotos;
    }
    catch (err){
      console.error(err.stack);
      return res.status(500).send({ error: "Server error" });
    }
  }

  const values = {
    ...newContact,
    photos: newContact.photos || [],
    contactId: utils.generateUUID()
  }

  console.log(values)
  
  let data;
  try{
    const newContactDoc = new ContactsCol(values);
    console.log(newContactDoc)
    data = await utils.saveAndPopulate({doc:newContactDoc, col:ContactsCol});
  }
  catch (err){
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "contact post",
    data: data
  })
}


exports.put = async (req, res) => {
  let newContact = req.body;
  const uploadedPhotos = req.file;

  const query = {
    _id: newContact.OID,
    deletedAt: null
  }

  try{
    newContact = await utils.managePhotosUpdate({
      col: ContactsCol,
      query: query,
      uploadedPhotos: uploadedPhotos,
      newDoc: newContact
    });
  } catch(err){
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }

  const values = {
    $set: {
      ...newContact
    }
  }

  const options = { 
    new: true
  }

  try{
    newContact = await utils.updateAndPopulate({ query: query, values: values, options: options, col: ContactsCol });
    
    if (!newContact) 
      throw new Error("Contact not found");

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
    message: "contact put",
    data: newContact
  })
}

exports.delete = async (req, res) => {
  const { OID } = req.params; 

  let contactDoc;
  try {
    contactDoc = await ContactsCol.findOneAndUpdate(
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

  if (!contactDoc) {
    return res.status(404).send({ error: "Contact not found" });
  }
  
  res.status(200).send({
    message: "Contact deleted",
    data: {
      OID: OID
    }
  })
}