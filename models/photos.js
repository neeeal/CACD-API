const mongoose = require("mongoose");
// const { Schema } = require("mongoose");

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
    image: {
      type: Object,
      required: true,
    },
    eventOID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "events",
      default: null,
    },
    // imageInfo: {},
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
  }
);

const photo = mongoose.model("photos", photoSchema);
module.exports = photo;
