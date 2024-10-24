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
    image: {
      type: String,
      required: true,
    },
    deletedAt: {
      type: date
    }
  },
  {
    timestamps: true,
  }
);

const user = mongoose.model("teams", teamSchema);
module.exports = team;
