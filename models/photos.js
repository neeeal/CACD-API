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
      type: date
    }
  },
  {
    timestamps: true,
  }
);

const user = mongoose.model("photos", photoSchema);
module.exports = photo;
