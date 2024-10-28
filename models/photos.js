const mongoose = require("mongoose");
// const { Schema } = require("mongoose");

const photoSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    caption: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    event: {
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
  }
);

const photo = mongoose.model("photos", photoSchema);
module.exports = photo;
