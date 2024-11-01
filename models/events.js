const mongoose = require("mongoose");
// const { Schema } = require("mongoose");

const eventSchema = mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    start: {
      type: Date,
      required: true,
    },
    end: {
      type: Date,
      required: true,
    },
    hostChurchOID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "churches",
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: "Active",
      enum: ["Active", "TBA", "Cancelled"]
    },
    location: {
      type: String,
      required: true,
    },
    registerLink: {
      type: String,
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null
    },
    // featuredPhoto: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: "photos",
    //   default: null,
    // },
    photos: {
    type: [mongoose.Schema.Types.ObjectId],
      ref: "photos",
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

const event = mongoose.model("events", eventSchema);
module.exports = event;
