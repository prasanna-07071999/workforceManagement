const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const JobSchema = new Schema(
  {
    organisationId: {
      type: Schema.Types.ObjectId,
      ref: "Organisation",
      required: true
    },

    title: {
      type: String,
      required: true
    },

    requiredSkills: {
      type: [String],
      default: []
    },

    qualifications: {
      type: String,
      default: ""
    },

    startDate: {
      type: Date
    },

    deadline: {
      type: Date
    },

    status: {
      type: String,
      enum: ["Open", "Closed"],
      default: "Open"
    }
  },
  { timestamps: true }
);

module.exports = model("Job", JobSchema)