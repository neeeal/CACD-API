const mongoose = require("mongoose");
// const { Schema } = require("mongoose");

const teamSchema = mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    photos: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "photos",
      default: [],
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
  }
);

// Add custom validation for only one photo
teamSchema.path('photos').validate(function (photos) {
  return photos.length <= 1; // Limit to only one photo
}, 'An album can only have one photo.');

const team = mongoose.model("teams", teamSchema);
module.exports = team;
