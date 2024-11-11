const mongoose = require("mongoose");

const companySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: null,
    },
    location: {
      type: String,
      default: null,
    },
    contacts: {
      type: Object,
      required: true,
    },
    photos: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "photos",
      },
    ],
    deletedAt: {
      type: Date,
      default: null,
    },
    donationChannels: {
      bank: [
        {
          bankName: { type: String, default: null },
          accountNumber: { type: String, default: null },
          accountHolderName: { type: String, default: null },
          address: { type: String, default: null},
          swiftCode: { type: String, default: null},
        },
      ],
      ewallet: [
        {
          wallet: { type: String, default: null },
          firstName: { type: String, default: null },
          lastName: { type: String, default: null },
          accountNumber: { type: String, default: null },
        },
      ],
      paypal: [
        {
          email: { type: String, required: true },
          password: { type: String, default: null }
        },
      ],
    },
  },
  {
    timestamps: true,
  }
);

// Add custom validation for only one photo
companySchema.path('photos').validate(function (photos) {
  return photos.length <= 1; // Limit to only one photo
}, 'A company can only have one photo.');

const Company = mongoose.model("companies", companySchema);
module.exports = Company;
