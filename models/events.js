const mongoose = require("mongoose");
// const { Schema } = require("mongoose");

const eventSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    dateEnd: {
      type: Date,
      // required: true,
    },
    hostChurchOID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "churches",
      required: true,
    },
    // status: {
    //   type: String,
    //   required: true,
    //   default: "Active",
    //   enum: ["Active", "TBA", "Cancelled", "Ongoing", "Finished"]
    // },
    acceptingRegistrations:{
      type: Boolean,
      required: true,
    },
    tickets:[{
        // ticketId:{
        //   type: String,
        //   required: true,
        // },
        name:{
          type: String,
          default: "Free",
        },
        price:{
          type: Number,
          required: true,
        },
        pax:{
          type: Number,
          default: 1
        },
        deletedAt: {
          type: Date,
          default: null,
        }
    }],
    slots:{
      type: Number,
      required: true,
    },
    tags: {
      type: [String],
      default: []
      // required: true,
      // default: null,
      // enum: ["Men", "Women", "Youth", "National", "Leaders"]
    },
    location: {
      type: String,
      required: true,
    },
    // registerLink: {
    //   type: String,
    //   required: true,
    // },
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
      default: [],
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies",
      required: true 
    },
  },
  {
    timestamps: true,
  }
);

const event = mongoose.model("events", eventSchema);
module.exports = event;
