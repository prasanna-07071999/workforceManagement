const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const HolidaySchema = new Schema(
  {
    organisationId: {
      type: Schema.Types.ObjectId,
      ref: "Organisation",
      required: true
    },

    date: {
      type: String, // YYYY-MM-DD
      required: true
    },

    name: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

// 🔐 One holiday per org per date
HolidaySchema.index(
  { organisationId: 1, date: 1 },
  { unique: true }
);

module.exports = model("Holiday", HolidaySchema);