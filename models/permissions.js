const mongoose = require("mongoose");
// const { Schema } = require("mongoose");

const permisionSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true
    },
    description: {
      type: String,
      default: null
    },
    deletedAt: {
      type: Date,
      default: null
    },
    company: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "companies",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

const permision = mongoose.model("permissions", permisionSchema);
module.exports = permision;
