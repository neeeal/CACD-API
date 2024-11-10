const mongoose = require("mongoose");

const companySchema = mongoose.Schema(
  {
    name: {
      type: String,
      default: null
    },
    location: {
      type: String,
      default: null
    },
    contacts: {
      type: Object,
      required: true,
    },
    photos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "photos"
      }
    ],
    deletedAt: {
      type: Date,
      default: null
    },
  },
  {
    timestamps: true
  }
);

// Add custom validation for only one photo
companySchema.path('photos').validate(function (photos) {
  return photos.length <= 1; // Limit to only one photo
}, 'An company can only have one photo.');

const Company = mongoose.model("companies", companySchema);
module.exports = Company;
