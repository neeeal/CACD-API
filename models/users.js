const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      // unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
    },
    username: {
      type: String,
      required: true,
      // unique: true,
      match: /^[a-zA-Z0-9]+$/, 
      minlength: 4,
      maxlength: 20,
    },
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
      // match: /^(?=.*[!@#$%^_-&*])[a-zA-Z0-9!@#$%^_-&*]+$/, 
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, 
  }
);

const User = mongoose.model("users", userSchema); 
module.exports = User;
