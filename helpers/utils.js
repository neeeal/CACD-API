const mongoose = require("mongoose");
const PhotosCol = require("../models/photos.js");
const RolesCol = require("../models/roles.js");
const PermissionsCol = require("../models/permissions.js");
const RolePermissionsCol = require("../models/rolePermissions.js");
const ContactsCol = require("../models/contacts.js");
const CompaniesCol = require("../models/companies.js");
const moment = require("moment");
const jwt = require("jsonwebtoken");
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const EventRegistrationsCol = require("../models/eventRegistrations.js");

/*
  TODO: Modularize utils. create other files for like functions.
*/

// TODO: remove deleted at, created at, and other non-relevant fields when populating

exports.isDuplicateKeyError = (errorMessage) => {
  const regex = /dup key: \{ (\w+):/;
  const match = errorMessage.match(regex);
  return match[1] || false;
}

exports.isOID = (OID) => {
  return mongoose.isValidObjectId(OID) ? OID : false;
}

// exports.stringToOID = (string) => {
//   return mongoose.Types.ObjectId.createFromHexString(string);
// }

exports.generateUUID = () => {
  return uuid.v4();
}

exports.pathToURL = ({metadata, path}) => {
  console.log('metadata')
  console.log(metadata)
  console.log('metadata')
  const extension = metadata.mimetype.split('/')[1];
  return `${metadata.location}.${extension}`


  // OLD LOCAL METHOD
  // const base = process.env.IMAGE_DEVURI;
  // return base + path.split('\\').pop() // Adjust the path accordingly
  // return process.env.IMAGE_DEVURI + path.includes("\\") ? path.split('\\').pop() : path.split('/').pop(); // Adjust the path accordingly
}

// exports.pathToURL = (path) => {
//   return process.env.IMAGE_DEVURI + path.split('\\').pop() // Adjust the path accordingly
// }

exports.removeExtension = (filename) => {
  const parts = filename.split(".");

  parts.pop();

  return parts.join(".");
}

exports.hardDeletePhotos = async ({photos, col, doc}) => {
  // const photoPath = path.join(__dirname, "..", originalPath);
  // const photoPath = originalPath;
  // console.log("photoOID")
  console.log("hard delte utils")
  console.log(photos)

  // // Hard Delete (delete file from storage)
  await Promise.all(
    photos.map(async (photo) => {
        await fs.promises.unlink(photo.path);
    })
  )

  let newDoc;
  if (col)
    newDoc = exports.updateDocPhotos({photos: photos, col: col, doc: doc});
  
  // const doc = await col.findOneAndUpdate(
  //   {
  //     photos: photos._id,
  //     deletedAt: null
  //   }, 
  //   {
  //     photos: null
  //   },
  //   {
  //     new: true
  //   }
  // )

  // Soft Delete (Update the deletedAt field)
  // const photoDoc = await PhotosCol.findOneAndUpdate(
  //   {
  //     _id: photoOID,
  //     deletedAt: null
  //   }, 
  //   {
  //     deletedAt: moment().toISOString()
  //   },
  //   {
  //     new: true
  //   }
  // )
  console.log("photo hard deleted successfully.");
  return;
}

exports.softDeletePhotos = async ({photos, doc, col}) => {
  // Soft Delete (Update the deletedAt field)
  let photoDocs;
  if (!Array.isArray(photos)){
    // Soft delete one photo
    console.log(photos)
    photoDocs = await PhotosCol.findOneAndUpdate(
      {
        _id: photos,
        deletedAt: null
      }, 
      {
        deletedAt: moment().toISOString()
      },
      {
        new: true
      }
    )
  } else {
    console.log("HERE")
    // Soft delete multiple photos
    photoDocs = await PhotosCol.updateMany(
      {
        _id: { $in: photos },
        deletedAt: null
      }, 
      {
        deletedAt: moment().toISOString()
      }
    )
  }
  
  let newDoc;
  if (col)
    newDoc = exports.updateDocPhotos({photos: photos, col: col, doc: doc});

  console.log("photo soft deleted successfully.");
  return newDoc || photoDocs;
}

exports.ISOToDate = (iso) => {
  console.log(iso)
  return moment(iso).toDate();
}

exports.dateToISO = (date) => {
  return moment(date).toISOString();
}

exports.savePhotos = async ({uploadedPhotos, details}) => {
  console.log(uploadedPhotos)
  const values = {
    metadata: {...uploadedPhotos},
    ...details,
    title: details.title || exports.removeExtension(uploadedPhotos.originalname),
    caption: details.caption || null,
    // eventOID: details.eventOID || [],
    album: details.album || null,
    company: details.company
    // photoInfo: photo,
  }
  
  const newPhotoDoc = new PhotosCol(values);
  const data = await newPhotoDoc.save();

  return newPhotoDoc;
}

exports.saveMultiplePhotos = async({uploadedPhotos, details}) => {
  if (!uploadedPhotos || Object.keys(uploadedPhotos).length === 0) {
    console.log("No photos to upload");
    return null;
  }

  const allOIDS = await Promise.all(
    uploadedPhotos.map(async (uploadedPhoto, idx) => {
      const values = {
        metadata: { ...uploadedPhoto },
        title: exports.removeExtension(uploadedPhoto.originalname),
        company: details.company
        // Additional fields like caption, album, eventOID, etc. can be added if needed
      };
      console.log(values)
      // Create a new photo document
      const photoDocument = new PhotosCol(values);
  
      // Save the photo document to the database
      const savedPhoto = await photoDocument.save();
  
      // Return the saved document's ID
      return savedPhoto._id;
    })
  );
  
  console.log(allOIDS); // All processed photo IDs
  

  const insertedOIDS = allOIDS.flat();

  console.log("insertedOIDS");
  console.log(insertedOIDS)

  return insertedOIDS;
}


// exports.saveMultiplePhotos = async ({uploadedPhotos, details}) => {
//   if (!uploadedPhotos || Object.keys(uploadedPhotos).length === 0) {
//     throw new Error("No photos to upload");
//   }

//   // Map over uploadedPhotos to create an array of photo documents
//   const photoDocuments = uploadedPhotos.map((uploadedPhotos,idx) => {
//     const values = {
//       ...uploadedPhotos,
//       title: exports.removeExtension(uploadedPhotos.originalname),
//       // title: details[idx].title || exports.removeExtension(uploadedPhotos.originalname),
//       // caption: details[idx].caption,
//       // eventOID: details[idx].eventOID || null,
//       // photoInfo: photo,
//     }
    
//     const newPhotoDoc = new PhotosCol(values);
//     return newPhotoDoc;
//   });

//   // const values = {
//   //   ...uploadedPhotos,
//   //   title: exports.removeExtension(uploadedPhotos.originalname),
//   //   eventOID: details.eventOID || null,
//   //   // photoInfo: photo,
//   // }
  
//   const savedPhotos = await PhotosCol.insertMany(photoDocuments);
//   return photoDocuments; // Return saved documents
// }

exports.updatePhoto = async ({uploadedPhotos, details}) => {
  console.log("updatePhoto")
  console.log(details)
  console.log(uploadedPhotos)
  console.log("updatePhoto")
  const values = {
    $set: {
      metadata: {...uploadedPhotos},
      title: details.title || exports.removeExtension(uploadedPhotos.originalname),
      caption: details.caption,
      eventOID: details.eventOID || null,
      album: details.album || null,
  }
  }

  const query = {
    _id: details.photoOID || // Photo route update
    details.featuredPhoto || // event route update
    details.photos, // team route update
    deletedAt: null
  }

  const options = { 
    new: true
  }

  const oldData = await PhotosCol.findOne(query);
  let data = await PhotosCol.findOneAndUpdate(query, values, options)
  console.log(query)
  console.log(oldData)
  console.log(data)

  if (!data) {
    data = await exports.savePhotos({uploadedPhotos:uploadedPhotos, details:details})
    // throw new Error("Photo not found");
    console.log("No Existing Photo")
  }

  // // TODO: Handle photo deletion on update
  // if(oldData && data) {
  //   if (oldData.originalname != data.originalname) {
  //     console.log("updatePhoto soft delete")
  //     await exports.softDeletePhotos({photos: oldData});
  //   }
  //   // else{
  //   //   console.log("updatePhoto hard delete")
  //   //   await exports.hardDeletePhotos({photos: data});
  //   // }
  // }

  return data;
}

exports.updateDocPhotos = async ({photos, doc, col}) => {
  let newDoc;

  const query = {
    // photos: photos._id,
    _id: doc.OID || doc._id,
    deletedAt: null
  };

  const values = {
    $pull: { photos: {
      $in: 
      !Array.isArray(photos) 
        ? [photos]
        : [...photos]
    }
    }
  };

  const options = { new: true };

  console.log("photos")
  console.log(query)
  console.log(values)
  console.log("photos")
    // If accepting multiple photos
    newDoc = await col.findOneAndUpdate(query, values,options);
    console.log(      {
      $pull: { photos: 
        !Array.isArray(photos) 
          ? [photos]
          : [...photos]
      }
    })
  console.log("updateDocPhotos")
  console.log(newDoc)
  console.log("updateDocPhotos")
  return newDoc;
}

exports.getOldPhotos = async ({col, query}) => {
  let oldPhotos;
    oldPhotos = await col
    .findOne(query)
    .select("photos")
    .populate("photos")
    .lean();
    // .photos;
    // console.log("OLD")
    // console.log(query)
    // console.log(oldPhotos)
    // console.log("OLD")

    return oldPhotos?.photos;
}

exports.managePhotosUpdate = async ({col, query, uploadedPhotos, newDoc}) => {
  // Ca
  let oldPhotos;
  // try{
    oldPhotos = await exports.getOldPhotos({ col: col, query: query });
  // }
  // catch (err){
  //   console.log("Old Photo Retrieval")
  //   console.error(err.stack);
  //   return res.status(500).send({ error: "Server error" });
  // }
  upload = uploadedPhotos.length && uploadedPhotos[0];

  if (uploadedPhotos && uploadedPhotos.length) {

  // If has uploadedPhotos
    upload.fieldname = 
    upload.fieldname.includes("new") ?
      upload.fieldname.replace(/^new/, "").replace(/^./, (char) => char.toLowerCase()) :
      upload.fieldname;

    let savedPhotos;
    if (oldPhotos && oldPhotos.length){
      // Update existing photo doc
      console.log("managePhotosUpdate update")
      newDoc.photos = oldPhotos;
      savedPhotos = await exports.updatePhoto({uploadedPhotos:upload, details:newDoc});
      console.log(savedPhotos)
    } else {
      // create new photo doc
      console.log("managePhotosUpdate save")
      savedPhotos = await exports.savePhotos({uploadedPhotos:upload, details:newDoc});
      console.log(savedPhotos)
      newDoc.photos = [savedPhotos._id];
    }
  } else if (!upload && newDoc.deletePhoto && oldPhotos){
    // no new uploaded photo and deletePhoto is true and has old photo
    // hard delete
    console.log("managePhotosUpdate hard delete");
    await exports.softDeletePhotos({photos: oldPhotos, col: col, doc: newDoc});
  }
console.log(!upload && newDoc.deletePhoto && oldPhotos)
  return newDoc;
}

exports.updateMultiplePhotos = async ({uploadedPhotos, col, doc}) => {
  const savedPhotos = await exports.saveMultiplePhotos({uploadedPhotos:uploadedPhotos, details:doc});

  const query = {
    _id: doc.OID || doc._id,
    deletedAt: null
  };

  console.log("savedPhotos")
  console.log(savedPhotos)
  console.log("savedPhotos")

  const values = {
      $push: { photos: [...savedPhotos] }
  };

  const options = { 
    new: true
  };

  // console.log("TESTING")
  // console.log(query)
  // console.log(values)
  // console.log("TESTING")

  const newDoc = await col.findOneAndUpdate(query, values, options);

  console.log("updateMultiplePhotos");
  console.log(newDoc);
  console.log("updateMultiplePhotos");

  return newDoc;
}

exports.manageMultiplePhotosUpdate = async ({col, query, uploadedPhotos, newDoc}) => {
  let oldPhotos;
  // try{
    if (col)
      oldPhotos = await exports.getOldPhotos({ col: col, query: query });
  // }
  // catch (err){
  //   console.log("Old Photo Retrieval")
  //   console.error(err.stack);
  //   return res.status(500).send({ error: "Server error" });
  // }

  let savedPhotos;
  if (uploadedPhotos && Object.keys(uploadedPhotos).length) {
      uploadedPhotos.map(photo => {
        // Process each photo object
        Object.keys(photo).forEach(fieldName => {
          photo[fieldName] = 
            photo[fieldName].includes("new") ?
              photo[fieldName].replace(/^new/, "").replace(/^./, (char) => char.toLowerCase()) :
              photo[fieldName];
        });
      
        return photo;
      });

      if (oldPhotos && oldPhotos.length) {
        // Update existing photo doc
        console.log("manageMultiplePhotosUpdate update")
        newDoc.photos = oldPhotos._id;
        newDoc = await exports.updateMultiplePhotos({uploadedPhotos:uploadedPhotos, doc:newDoc, col: col});
        console.log('UPDATE OLD')
      } else {
        // create new photo doc
        console.log("manageMultiplePhotosUpdate save")
        savedPhotos = await exports.saveMultiplePhotos({uploadedPhotos:uploadedPhotos, details:newDoc});
        console.log('CREATE NEW')
        if (newDoc) 
          newDoc.photos = savedPhotos;
      }
  } else if (newDoc.deleteMulPhotos && newDoc.deleteMulPhotos.length){
    // delete old photos from given oid
    console.log("manageMultiplePhotosUpdate soft delete");
    // const results = newDoc.deleteMulPhotos.map( oid => {
    //   return exports.hardDeletePhotos({ photos: {_id: oid}, col: col });
      // })
      newDoc = exports.softDeletePhotos({ photos: newDoc.deleteMulPhotos, col: col, doc: newDoc });
  }

  return newDoc || savedPhotos;
}

// exports.SoftDeleteMultiplePhotos = async ({doc, col}) => {
//   const photos = doc.deleteMulPhotos;

//   const newDoc = exports.softDeletePhotos({ photos: photos, col: col, doc: doc });
  
//   return newDoc;
// }

// exports.formatMulPhotosField = ({ mulPhotos }) => {

//   const uniqueFieldnames = [...new Set(mulPhotos.map(photo => photo.fieldname))];

//   const formattedMulPhotos = {...uniqueFieldnames.map()}

//   return formattedMulPhotos;
// }

exports.saveAndPopulate = async ({doc, col}) => {
  console.log("saveAndPopulate");
  console.log(doc);
  console.log(col);
  console.log("saveAndPopulate");
  
  // Save the document
  const data = await doc.save();

  // Initialize an empty array to hold populate values
  let populateValues = [];

  // Add 'photos' population if the collection is not PhotosCol
  if (![PhotosCol].includes(col)) {
    populateValues.push({
      path: "photos",
      match: { deletedAt: null },
      select: "-__v -id"
    });
  }

  // Add 'companies' population if the collection is not CompaniesCol
  if (col != CompaniesCol) {
    populateValues.push({
      path: "company",
      match: { deletedAt: null },
      select: "-__v"
    });
  }

  // Populate the document with the values in populateValues array
  await data.populate(populateValues);

  return data;
}

exports.updateAndPopulate = async ({query, values, options, col, populate = true }) => {
  const data = await col.findOneAndUpdate(query, values, options);
  console.log('data')
  console.log(data)
  if(!data){
    return null;
  }
  console.log('data')
  // Initialize an empty array to hold populate values
  let populateValues = [];

  if(populate){
    // Add 'photos' population if the collection is not PhotosCol or RolesCol (roles DOES NOT have photos)
    if (![PhotosCol, RolesCol, PermissionsCol, RolePermissionsCol].includes(col)) {
      populateValues.push({
        path: "photos",
        match: { deletedAt: null },
        select: "-__v -id"
      });
    }
  
    // Add 'companies' population if the collection is not CompaniesCol
    if (![CompaniesCol, RolePermissionsCol].includes(col)) {
      populateValues.push({
        path: "company",
        match: { deletedAt: null },
        select: "-__v"
      });
    }

    if (col === RolePermissionsCol){
      populateValues.push({
        path: "role",
        match: { deletedAt: null },
        select: "-__v"
      });

      populateValues.push({
        path: "permission",
        match: { deletedAt: null },
        select: "-__v"
      });
    }

    await data.populate(populateValues);
  }

  // Populate the document with the values in populateValues array
  return data;
}

exports.getAndPopulate = async ({ query, col, offset = 0, limit = 0, populate = true }) => {
  let queryBuilder = col.find(query)
    .skip(offset * limit) 
    .limit(limit); 

  let populateValues = [];

  if(populate){
    // Add 'photos' population if the collection is not PhotosCol or RolesCol (roles DOES NOT have photos)
    if (![PhotosCol, RolesCol, PermissionsCol, RolePermissionsCol].includes(col)) {
      populateValues.push({
        path: "photos",
        match: { deletedAt: null },
        select: "-__v -id", 
      });
    }
  
    // Add 'companies' population if the collection is not CompaniesCol
    if (![CompaniesCol].includes(col)) {
      populateValues.push({
        path: "company", 
        match: { deletedAt: null },
        select: "-__v", 
      });
    }  

    if (col == RolePermissionsCol){
      populateValues.push({
        path: "role",
        match: { deletedAt: null },
        select: "-__v"
      });

      populateValues.push({
        path: "permission",
        match: { deletedAt: null },
        select: "-__v"
      });
    }

    if (col == EventRegistrationsCol){
      populateValues.push({
        path: "ticket",
        match: { deletedAt: null },
        select: "-__v"
      });
    }
  }

  let data;
  // try {
    data = await queryBuilder.exec();
    if (data && populateValues.length > 0) {
      if (Array.isArray(data)) {
        for (let item of data) {
          await item.populate(populateValues);
        }
      } else {
        await data.populate(populateValues);
      }
    }
  // } catch (err) {
  //   console.error("Error executing query and populate:", err);
  //   throw new Error("Error fetching and populating data");
  // }

  console.log(data)

  return data;
};

exports.queryBuilder =  ({initialQuery, queryParams = {}}) => {

  // TODO: improve query builder to handle multiple queries for in-company and all resource GET requests
  const query = initialQuery;
  
  if (queryParams.company) {
    query.company = queryParams.company;
  }
  
  if (queryParams.tags) {
    query.tags = { $in: queryParams.tags};
  }

  if (queryParams.OID) {
    if (!exports.isOID(queryParams.OID)) {
      throw new Error("Invalid ObjectId");
    }
    query._id = queryParams.OID;
  }

  if (queryParams.contactId) {
    query.contactId = queryParams.contactId;
  }

  // if (queryParams.role) {
  //   const roleDoc = await RolesCol.findOne({})
  //   query.role = queryParams.OID;
  // }

  return query;
}

exports.generateToken = async({existingUser, type="access", expiresIn='1hr', secretKey=process.env.SECRET_KEY_ACCESS_TOKEN}) => {
  const payload = {
    ...existingUser,
    type: type
  };

  // Generate access token
  const accessToken = jwt.sign(
    payload,
    secretKey,
    { expiresIn: expiresIn }
  );

  console.log(accessToken);
  return accessToken;
}