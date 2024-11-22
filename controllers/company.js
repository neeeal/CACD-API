const CompaniesCol = require("../models/companies.js");
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
      col: CompaniesCol,
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
    message: "companies get",
    data: data || [],
    count: data && data.length
  })
}

exports.getOne = async (req, res) => {
  const params = req.params;

  let data;
  try{
    const query = { deletedAt: null, _id: params.companyOid };

    data = await utils.getAndPopulate({
      query: query,
      col: CompaniesCol,
    });
    
  } catch (err) {
    console.error(err.stack);

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message)){
      return res.status(404).send({ error: "Invalid ObjectId" });
    }

    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "company get",
    data: data?.[0] || [],
    count: data && data.length 
  })
}

exports.post = async (req, res) => {
  let newCompany = req.body;
  const uploadedPhotos = req.file;

  console.log(uploadedPhotos)

  if (uploadedPhotos) {
    try{
      const savedPhotos = await utils.savePhotos({uploadedPhotos:uploadedPhotos, details:newCompany});
      newCompany.photos = savedPhotos._id;
    }
    catch (err){
      console.error(err.stack);
      return res.status(500).send({ error: "Server error" });
    }
  }

  try{
    newCompany = new CompaniesCol(newCompany);
    await utils.saveAndPopulate({doc:newCompany, col:CompaniesCol});
  } catch (err) {
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }

  res.status(200).send({
    message: "post",
    data: newCompany 
  });
}

exports.put = async (req, res) => {
  let newCompany = req.body;
  const uploadedPhotos = req.file;

  const query = {
    _id: newCompany.OID,
    deletedAt: null
  };

  try{
    newCompany = await utils.managePhotosUpdate({
      col: CompaniesCol,
      query: query,
      uploadedPhotos: uploadedPhotos,
      newDoc: newCompany
    });
  } catch(err){
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }

  const values = {
    $set: {
      ...newCompany
    }
  };

  const options = { new: true };

  try{
    newCompany = await utils.updateAndPopulate({ query: query, values: values, options: options, col: CompaniesCol });

    if (!newCompany) 
      throw new Error("Company not found");

  } catch(err){
    console.error(err.stack);

    if (err.message.includes("not found"))
      return res.status(404).send({ error: err.message });

    if (/Invalid ObjectId|Cast to ObjectId failed/.test(err.message))
      return res.status(404).send({
      error: "Invalid Object ID"
    }); 
  }

  res.status(200).send({
    message: "put",
    data: newCompany 
  });
}

exports.delete = async (req, res) => {
  
  const { OID } = req.params; 

  let newCompany;
  try {
    newCompany = await CompaniesCol.findOneAndUpdate(
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

  if (!newCompany) {
    return res.status(404).send({ error: "Company not found" });
  }
  
  res.status(200).send({
    message: "delete",
    data: newCompany 
  });
}