const mongoose = require("mongoose");

const eventRegistrationSchema = mongoose.Schema(
  {
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "event",
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies",
      required: true 
    },
    photos: { // Explicitly defined photos field within the object
      type: [mongoose.Schema.Types.ObjectId],
      ref: "photos",
      default: [],
    },
    registrantInfo: { // Flexible and includes photos
          type: mongoose.Schema.Types.Mixed,
          default: {},
        },
    tickets:[{
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    }]
  },
  {
    timestamps: true,
  }
);

const eventRegistration = mongoose.model("eventRegistrations", eventRegistrationSchema);
module.exports = eventRegistration;
