const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const DailyUpdateSchema = new Schema(
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

    description: {
      type: String,
      required: true
    },

    // 🔥 future-ready fields
    blockers: [String],
    tasks: [String]
  },
  { timestamps: true }
);

DailyUpdateSchema.index(
  { userId: 1, date: 1 },
  { unique: true }
);

module.exports = model("DailyUpdate", DailyUpdateSchema);