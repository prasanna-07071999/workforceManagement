const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const AttendanceSchema = new Schema(
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

    date: {
      type: String, // YYYY-MM-DD
      required: true
    },

    status: {
      type: String,
      enum: ["Present", "Absent", "Leave", "Holiday"],
      default: "Present"
    },

    checkInTime: {
      type: Date
    },

    checkOutTime: {
      type: Date
    }
  },
  { timestamps: true }
);

// 🔐 One attendance per user per day
AttendanceSchema.index(
  { userId: 1, date: 1 },
  { unique: true }
);

module.exports = model("Attendance", AttendanceSchema);