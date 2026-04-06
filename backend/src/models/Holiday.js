const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const HolidaySchema = new Schema(
  {
    organisationId: {
      type: Schema.Types.ObjectId,
      ref: "Organisation",
      required: true
    },

    // One-time holiday
    date: {
      type: Date
    },

    // Recurring holiday
    month: Number,
    day: Number,
    isRecurring: {
      type: Boolean,
      default: false
    },

    name: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

// unique per org per day
HolidaySchema.index(
  { organisationId: 1, date: 1 },
  { unique: true }
);

module.exports = model("Holiday", HolidaySchema);