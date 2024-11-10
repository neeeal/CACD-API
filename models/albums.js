const mongoose = require("mongoose");

const albumSchema = mongoose.Schema(
  {
    title: {
      type: String,
      default: null
    },
    caption: {
      type: String,
      default: null
    },
    deletedAt: {
      type: Date,
      default: null
    },
    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "events",
      default: null
    },
    photos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "photos"
      }
    ]
  },
  {
    timestamps: true
  }
);

// Add custom validation for only one photo
albumSchema.path('photos').validate(function (photos) {
  return photos.length <= 1; // Limit to only one photo
}, 'An album can only have one photo.');

const Album = mongoose.model("album", albumSchema);
module.exports = Album;
