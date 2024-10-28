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
    image: {
      type: String,
      default: null
    },
    deletedAt: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true,
  }
);

const church = mongoose.model("churches", churchSchema);
module.exports = church;