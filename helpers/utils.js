const mongoose = require("mongoose");
const PhotosCol = require("../models/photos.js");
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

exports.hardDeletePhoto = async ({photos, col}) => {
  // const photoPath = path.join(__dirname, "..", originalPath);
  // const photoPath = originalPath;
  // console.log("photoOID")
  console.log("hard delte utils")
  console.log(photos)

  // // Hard Delete (delete file from storage)
  await fs.promises.unlink(photos.path);

  let doc;
  if (col)
    doc = exports.updateDocPhotos({photos: photos, col: col});
  
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

exports.softDeletePhoto = async ({photos, doc, col}) => {
  // Soft Delete (Update the deletedAt field)
  if (!Array.isArray(photos)){
    // Soft delete one photo
    const photoDoc = await PhotosCol.findOneAndUpdate(
      {
        _id: photos._id,
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
    const photoDocs = await PhotosCol.updateMany(
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
  return;
}

exports.ISOToDate = (iso) => {
  console.log(iso)
  return moment(iso).toDate();
}

exports.dateToISO = (date) => {
  return moment(date).toISOString();
}

exports.savePhoto = async ({uploadedPhoto, details}) => {
  console.log(uploadedPhoto)
  const values = {
    ...uploadedPhoto,
    title: details.title || exports.removeExtension(uploadedPhoto.originalname),
    caption: details.caption,
    eventOID: details.eventOID || null,
    // photoInfo: photo,
  }
  
  const newPhotoDoc = new PhotosCol(values);
  const data = await newPhotoDoc.save();

  return newPhotoDoc;
}

exports.savePhotos = async({uploadedPhotos, details}) => {
  if (!uploadedPhotos || Object.keys(uploadedPhotos).length === 0) {
    console.log("No photos to upload");
    return null;
  }

  const allOIDS = await Promise.all(
    Object.keys(uploadedPhotos).map(async (fieldname) => {
      const photoDocuments = uploadedPhotos[fieldname].map((uploadedPhoto, idx) => {
      const values = {
          ...uploadedPhoto,
          title: exports.removeExtension(uploadedPhoto.originalname),
          // title: details[idx].title || exports.removeExtension(uploadedPhoto.originalname),
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
  //     const photoDocuments = uploadedPhotos[fieldname].map((uploadedPhoto,idx) => {
  //       const values = {
  //         ...uploadedPhoto,
  //         title: exports.removeExtension(uploadedPhoto.originalname),
  //         // title: details[idx].title || exports.removeExtension(uploadedPhoto.originalname),
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


// exports.savePhotos = async ({uploadedPhotos, details}) => {
//   if (!uploadedPhotos || Object.keys(uploadedPhotos).length === 0) {
//     throw new Error("No photos to upload");
//   }

//   // Map over uploadedPhotos to create an array of photo documents
//   const photoDocuments = uploadedPhotos.map((uploadedPhoto,idx) => {
//     const values = {
//       ...uploadedPhoto,
//       title: exports.removeExtension(uploadedPhoto.originalname),
//       // title: details[idx].title || exports.removeExtension(uploadedPhoto.originalname),
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

exports.updatePhoto = async ({uploadedPhoto, details}) => {
  console.log(details)
  console.log(uploadedPhoto)
  const values = {
    $set: {
      ...uploadedPhoto,
      title: details.title || exports.removeExtension(uploadedPhoto.originalname),
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
    data = await exports.savePhoto({uploadedPhoto:uploadedPhoto, details:details})
    // throw new Error("Photo not found");
    console.log("No Existing Photo")
  }

  // TODO: Handle photo deletion on update
  if(oldData && data) {
    if (oldData.originalname != data.originalname) {
      console.log("updatePhoto soft delete")
      await exports.softDeletePhoto({photos: oldData});
    }
    else{
      console.log("updatePhoto hard delete")
      await exports.hardDeletePhoto({photos: data});
    }
  }

  return data;
}

exports.updateDocPhotos = async ({photos, doc, col}) => {
  let newDoc;
  if (!Array.isArray(photos)) {
    // If only one photo
    newDoc = await col.findOneAndUpdate(
      {
        _id: doc.OID || doc._id,
        deletedAt: null
      }, 
      {
        photos: null
      },
      {
        new: true
      }
    );
  } else {
    // If accepting multiple photos
    newDoc = await col.findOneAndUpdate(
      {
        // photos: photos._id,
        _id: doc.OID || doc._id,
        deletedAt: null
      }, 
      {
        $pullAll: { photos: [...photos]}
      },
      {
        new: true
      }
    );
  }
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

exports.managePhotoUpdate = async ({col, query, uploadedPhoto, newDoc}) => {
  let oldPhotos;
  try{
    oldPhotos = await exports.getOldPhotos({ col: col, query: query });
    console.log(oldPhotos)
  }
  catch (err){
    console.log("Old Photo Retrieval")
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }

  if (uploadedPhoto) {
  // If has uploadedPhoto
    uploadedPhoto.fieldname = 
    uploadedPhoto.fieldname.includes("new") ?
      uploadedPhoto.fieldname.replace(/^new/, "").replace(/^./, (char) => char.toLowerCase()) :
      uploadedPhoto.fieldname;
    
    let savedPhoto;
    if (oldPhotos){
      // Update existing photo doc
      console.log("managePhotoUpdate update")
      newDoc.photos = oldPhotos._id;
      savedPhoto = await exports.updatePhoto({uploadedPhoto:uploadedPhoto, details:newDoc});
    } else {
      // create new photo doc
      console.log("managePhotoUpdate save")
      savedPhoto = await exports.savePhoto({uploadedPhoto:uploadedPhoto, details:newDoc});
      console.log(oldPhotos)
      newDoc.photos = savedPhoto._id;
    }
  } else if (!uploadedPhoto && newDoc.deletePhoto && oldPhotos){
    // no new uploaded photo and deletePhoto is true and has old photo
    // hard delete
    console.log("managePhotoUpdate hard delete");
    await exports.hardDeletePhoto({photos: oldPhotos, col: col});
  }

  return newDoc;
}

exports.manageMultiplePhotoUpdate = async ({col, query, uploadedPhotos, newDoc}) => {
  console.log("manageMultiplePhotoUpdate")
  console.log(newDoc)
  console.log("manageMultiplePhotoUpdate")

  let oldPhotos;
  try{
    oldPhotos = await exports.getOldPhotos({ col: col, query: query });
  }
  catch (err){
    console.log("Old Photo Retrieval")
    console.error(err.stack);
    return res.status(500).send({ error: "Server error" });
  }

  if (newDoc.deleteMulPhotos && newDoc.deleteMulPhotos.length){
    // delete old photos from given oid
    console.log("manageMultiplePhotoUpdate soft delete");
    // const results = newDoc.deleteMulPhotos.map( oid => {
    //   return exports.hardDeletePhoto({ photos: {_id: oid}, col: col });
      // })
      exports.softDeletePhoto({ photos: newDoc.deleteMulPhotos, col: col, doc: newDoc });
  }

  // await Promise.all(
  //   Object.keys(uploadedPhotos).map( async(fieldname) => {
  //     const photoDocuments = uploadedPhotos[fieldname].map((uploadedPhoto, idx) => {
  //       const values = {
  //           ...uploadedPhoto,
  //           title: exports.removeExtension(uploadedPhoto.originalname),
  //           // title: details[idx].title || exports.removeExtension(uploadedPhoto.originalname),
  //           // caption: details[idx].caption,
  //           // eventOID: details[idx].eventOID || null,
  //           // photoInfo: photo,
  //         }
  
  //         return new PhotosCol(values);
  //       });
  
  //       const savedPhotos = await PhotosCol.insertMany(photoDocuments);
  //       return savedPhotos.map((doc) => doc._id);
  //   })
  // )

  return newDoc;
}

// exports.formatMulPhotosField = ({ mulPhotos }) => {

//   const uniqueFieldnames = [...new Set(mulPhotos.map(photo => photo.fieldname))];

//   const formattedMulPhotos = {...uniqueFieldnames.map()}

//   return formattedMulPhotos;
// }