const mongoose = require("mongoose");
// const { Schema } = require("mongoose");

const userSchema = mongoose.Schema(
  {
    deleted_at: {
        type: Number,
        default: null,
    }
  },
  {
    timestamps: true,
  }
);

const user = mongoose.model("user", userSchema);
module.exports = user;
