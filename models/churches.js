const mongoose = require("mongoose");
// const { Schema } = require("mongoose");

const churchSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    elders: {
      type: [String],
      required: true,
    },
    ministers: {
      type: [String],
      required: true,
    },
    contacts: {
      type: Object,
      required: true,
    },
    // featuredPhoto:{
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "photos",
    // },
    photos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "photos",
        default: [],
      }
    ],
    deletedAt: {
      type: Date,
      default: null
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "photos",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const church = mongoose.model("churches", churchSchema);
module.exports = church;
