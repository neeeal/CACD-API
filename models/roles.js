const mongoose = require("mongoose");
// const { Schema } = require("mongoose");

const roleSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
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
      required: true
    },
  },
  {
    timestamps: true,
  }
);

const roles = mongoose.model("roles", roleSchema);
module.exports = roles;
