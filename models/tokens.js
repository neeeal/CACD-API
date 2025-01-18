const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema(
  {
    token: {
      type: String,
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    expiresAt: { 
      type: Date,
      required: true
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

// Create a TTL index on the `expiresAt` field. Tokens will be deleted automatically when `expiresAt` is reached.
tokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const Token = mongoose.model('Token', tokenSchema);
module.exports = Token;
