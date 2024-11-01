const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      // unique: true,
      match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, 
    },
    // username: {
    //   type: String,
    //   required: true,
    //   // unique: true,
    //   match: /^[a-zA-Z0-9]+$/, 
    //   minlength: 4,
    //   maxlength: 20,
    // },
    firstName: {
      type: String,
      required: true,
      minlength: 1,
    },
    lastName: {
      type: String,
      required: true,
      minlength: 2,
    },
    password: {
      type: String,
      required: true,
      // match: /^(?=.*[!@#$%^_-&*])[a-zA-Z0-9!@#$%^_-&*]+$/, 
    },
    photos: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "photos",
      default: null,
    },
    accessLevel: {
      type: String,
      default: 'Admin',
      enum: ['Admin', 'Super Admin'],
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

const user = mongoose.model("users", userSchema); 
module.exports = user;
