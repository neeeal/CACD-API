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
      required: true
    },
    originalname: {
      type: String,
      required: true
    },
    encoding: {
      type: String,
      required: true
    },
    mimetype: {
      type: String,
      required: true
    },
    destination: {
      type: String,
      required: true
    },
    filename: {
      type: String,
      required: true
    },
    path: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true
    },
    eventOID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "events",
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Virtual for photo URL
photoSchema.virtual("photoUrl").get(function () {
  return utils.pathToURL(this.path);
});

const Photo = mongoose.model("photos", photoSchema);
module.exports = Photo;
