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
    dateTimeStart: {
      type: String,
      required: true,
    },
    dateTimeEnd: {
      type: String,
      required: true,
    },
    host: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "church",
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
      type: date
    }
  },
  {
    timestamps: true,
  }
);

const user = mongoose.model("events", eventSchema);
module.exports = event;
