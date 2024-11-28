const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
    firstName: { 
        type: String, 
        required: true 
    },
    lastName: { 
        type: String, 
        required: true 
    },
    email: { 
        type: String, 
        required: true 
    },
    contact: { 
        type: String, 
        default: null 
    },
    message: { 
        type: String, 
        required: true 
    },
    photos: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "photos",
        },
      ],
    deletedAt: { 
        type: Date, 
        default: null
    },
    contactId: { 
        type: String, 
        required: true 
    },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "companies",
        required: true 
    },
});

module.exports = mongoose.model("contacts", contactSchema);