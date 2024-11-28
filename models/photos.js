const mongoose = require("mongoose");
const utils = require("../helpers/utils.js");

const photoSchema = mongoose.Schema(
  {
    title: {
      type: String,
      default: null
    },
    caption: {
      type: String,
      default: null
    },
    fieldname: {
      type: String,
      // required: true
      default: "default",
      enum: [
        "default", 
        "featuredPhoto", 
        "userPhoto", 
        "teamPhoto", 
        "companyPhoto",
        "adminPhoto",
        "paymentPhoto",
        "donationPhoto",
        "contactFile"
      ]
    },
    metadata: {
      type: Object,
      required: true
    },
    // eventOID: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "events",
    //   default: null,
    // },
    album: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "albums",
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies",
      required: true 
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for photo URL
// photoSchema.virtual("photoUrl").get(function () {
//   return utils.pathToURL({ metadata: this.metadata, path: this.path});
// });

const Photo = mongoose.model("photos", photoSchema);
module.exports = Photo;
