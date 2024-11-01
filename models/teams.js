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
      type: mongoose.Schema.Types.ObjectId,
      ref: "photos",
      default: null,
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

const team = mongoose.model("teams", teamSchema);
module.exports = team;
