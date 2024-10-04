const mongoose = require("mongoose");
// const { Schema } = require("mongoose");

const tokenSchema = mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "users",
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

const user = mongoose.model("tokens", tokenSchema);
module.exports = token;
