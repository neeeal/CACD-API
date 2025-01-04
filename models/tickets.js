const mongoose = require("mongoose");

const ticketSchema = mongoose.Schema(
  {
    ticketId:{
      type: String,
      required: true,
    },
    name:{
      type: String,
      required: true,
    },
    price:{
      type: Number,
      required: true,
    },
    pax:{
      type: Number,
      default: 1
    },
    deletedAt: {
      type: Date,
      default: null,
    }
  },
  {
    timestamps: true,
  }
);

const ticket = mongoose.model("tickets", ticketSchema);
module.exports = ticket;
