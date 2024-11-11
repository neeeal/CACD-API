const mongoose = require("mongoose");
const PhotosCol = require("../models/photos.js");
const CompaniesCol = require("../models/companies.js");
const moment = require("moment");
const path = require('path');
const fs = require('fs');

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

exports.pathToURL = (path) => {
  return process.env.IMAGE_DEVURI + path.split('\\').pop() // Adjust the path accordingly
}

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
    ...uploadedPhotos,
    ...details,
    title: details.title || exports.removeExtension(uploadedPhotos.originalname),
    // caption: details.caption,
    // eventOID: details.eventOID || [],
    // album: details.album || null,
    // photoInfo: photo,
  }
  
  const newPhotoDoc = new PhotosCol(values);
  const data = await newPhotoDoc.save();

  return newPhotoDoc;
}

exports.saveMultiplePhotos = async({uploadedPhotos, doc}) => {
  if (!uploadedPhotos || Object.keys(uploadedPhotos).length === 0) {
    console.log("No photos to upload");
    return null;
  }

  const allOIDS = await Promise.all(
    Object.keys(uploadedPhotos).map(async (fieldname) => {
      const photoDocuments = uploadedPhotos[fieldname].map((uploadedPhotos, idx) => {
      const values = {
          ...uploadedPhotos,
          title: exports.removeExtension(uploadedPhotos.originalname),
          // title: details[idx].title || exports.removeExtension(uploadedPhotos.originalname),
          // caption: details[idx].caption,
          // eventOID: details[idx].eventOID || null,
          // photoInfo: photo,
        }

        return new PhotosCol(values);
      });

      const savedPhotos = await PhotosCol.insertMany(photoDocuments);
      return savedPhotos.map((doc) => doc._id);
    })
  )

  const insertedOIDS = allOIDS.flat();

  console.log("insertedOIDS");
  console.log(insertedOIDS)

  return insertedOIDS;

  // await Promise.all(
  //   Object.keys(uploadedPhotos).forEach(async (fieldname) => {
  //     const photoDocuments = uploadedPhotos[fieldname].map((uploadedPhotos,idx) => {
  //       const values = {
  //         ...uploadedPhotos,
  //         title: exports.removeExtension(uploadedPhotos.originalname),
  //         // title: details[idx].title || exports.removeExtension(uploadedPhotos.originalname),
  //         // caption: details[idx].caption,
  //         // eventOID: details[idx].eventOID || null,
  //         // photoInfo: photo,
  //       }
        
  //       const newPhotoDoc = new PhotosCol(values);
  //       return newPhotoDoc;
  //     });
  
  //     const savedPhotos = await PhotosCol.insertMany(photoDocuments);
  //   })
  // )
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
      ...uploadedPhotos,
      title: details.title || exports.removeExtension(uploadedPhotos.originalname),
      caption: details.caption,
      eventOID: details.eventOID || null
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

    return oldPhotos.photos;
}

exports.managePhotosUpdate = async ({col, query, uploadedPhotos, newDoc}) => {
  // Ca
  let oldPhotos;
  try{
    oldPhotos = await exports.getOldPhotos({ col: col, query: query });
    console.log("oldPhotos")
    console.log(oldPhotos)
  }
  catch (err){
    console.log("Old Photo Retrieval")
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }

  if (uploadedPhotos) {
  // If has uploadedPhotos
    uploadedPhotos.fieldname = 
    uploadedPhotos.fieldname.includes("new") ?
      uploadedPhotos.fieldname.replace(/^new/, "").replace(/^./, (char) => char.toLowerCase()) :
      uploadedPhotos.fieldname;
    
    let savedPhotos;
    if (oldPhotos && oldPhotos.length){
      // Update existing photo doc
      console.log("managePhotosUpdate update")
      newDoc.photos = oldPhotos;
      savedPhotos = await exports.updatePhoto({uploadedPhotos:uploadedPhotos, details:newDoc});
      console.log(savedPhotos)
    } else {
      // create new photo doc
      console.log("managePhotosUpdate save")
      savedPhotos = await exports.savePhotos({uploadedPhotos:uploadedPhotos, details:newDoc});
      console.log(savedPhotos)
      newDoc.photos = [savedPhotos._id];
    }
  } else if (!uploadedPhotos && newDoc.deletePhoto && oldPhotos){
    // no new uploaded photo and deletePhoto is true and has old photo
    // hard delete
    console.log("managePhotosUpdate hard delete");
    await exports.softDeletePhotos({photos: oldPhotos, col: col, doc: newDoc});
  }

  return newDoc;
}

exports.updateMultiplePhotos = async ({uploadedPhotos, col, doc}) => {
  const savedPhotos = await exports.saveMultiplePhotos({uploadedPhotos:uploadedPhotos, doc:doc});

  const query = {
    _id: doc.OID,
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

  // console.log("updateMultiplePhotos");
  // console.log(newDoc);
  // console.log("updateMultiplePhotos");

  return newDoc;
}

exports.manageMultiplePhotosUpdate = async ({col, query, uploadedPhotos, newDoc}) => {
  // console.log("manageMultiplePhotosUpdate")
  // console.log(newDoc)
  // console.log("manageMultiplePhotosUpdate")

  let oldPhotos;
  try{
    if (col)
      oldPhotos = await exports.getOldPhotos({ col: col, query: query });
  }
  catch (err){
    console.log("Old Photo Retrieval")
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }

  let savedPhotos;
  if (uploadedPhotos && Object.keys(uploadedPhotos).length) {
      Object.keys(uploadedPhotos).forEach(fieldName => {
        uploadedPhotos[fieldName].map(photo => {
          photo[fieldName] = 
          photo.fieldname.includes("new") ?
            photo.fieldname.replace(/^new/, "").replace(/^./, (char) => char.toLowerCase()) :
            photo.fieldname;

            return photo;
        })
      });

      if (oldPhotos && oldPhotos.length) {
        // Update existing photo doc
        console.log("manageMultiplePhotosUpdate update")
        newDoc.photos = oldPhotos._id;
        savedPhotos = await exports.updateMultiplePhotos({uploadedPhotos:uploadedPhotos, doc:newDoc, col: col});
      } else {
        // create new photo doc
        console.log("manageMultiplePhotosUpdate save")
        savedPhotos = await exports.saveMultiplePhotos({uploadedPhotos:uploadedPhotos, doc:newDoc});
        console.log(oldPhotos)
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
  if (col != PhotosCol) {
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

exports.updateAndPopulate = async ({query, values, options, col}) => {
  const data = await col.findOneAndUpdate(query, values, options);
  // Initialize an empty array to hold populate values
  let populateValues = [];

  // Add 'photos' population if the collection is not PhotosCol
  if (col != PhotosCol) {
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

exports.getAndPopulate = async ({ query, col, offset = 0, limit = 0 }) => {
  // Build the query first, and only execute it later
  let queryBuilder = col.find(query)
    .skip(offset * limit) // Apply offset here
    .limit(limit); // Apply limit here

  // Initialize an empty array to hold populate values
  let populateValues = [];

  // Conditionally add population for 'photos' if the collection is not PhotosCol
  if (col !== PhotosCol) {
    populateValues.push({
      path: "photos",
      match: { deletedAt: null },
      select: "-__v -id",  // Exclude unnecessary fields
    });
  }

  // Conditionally add population for 'company' if the collection is not CompaniesCol
  if (col !== CompaniesCol) {
    populateValues.push({
      path: "company",  // Ensure it's the correct field name (singular 'company')
      match: { deletedAt: null },
      select: "-__v",  // Exclude unnecessary fields
    });
  }

  // Execute the query
  let data;
  try {
    // Execute the query and return the result
    data = await queryBuilder.exec();
    if (data && populateValues.length > 0) {
      // If data is an array, use populate on each element
      if (Array.isArray(data)) {
        for (let item of data) {
          await item.populate(populateValues);
        }
      } else {
        // If data is a single document, populate it
        await data.populate(populateValues);
      }
    }
  } catch (err) {
    console.error("Error executing query and populate:", err);
    throw new Error("Error fetching and populating data");
  }

  return data;
};
