const mongoose = require("mongoose");

const rolePermissionSchema = mongoose.Schema(
  {
    name: {
      type: String,
      default: null
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
    permission: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "permissions",
      required: true,
    },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "roles",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const rolePermision = mongoose.model("rolePermissions", rolePermissionSchema);
module.exports = rolePermision;
