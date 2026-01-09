const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const LeaveSchema = new Schema(
  {
    organisationId: {
      type: Schema.Types.ObjectId,
      ref: "Organisation",
      required: true
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    fromDate: {
      type: String, // YYYY-MM-DD
      required: true
    },

    toDate: {
      type: String, // YYYY-MM-DD
      required: true
    },

    reason: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending"
    },

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "User"
    },

    approvedAt: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = model("Leave", LeaveSchema);
