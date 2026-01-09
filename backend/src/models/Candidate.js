const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const CandidateSchema = new Schema(
  {
    organisationId: {
      type: Schema.Types.ObjectId,
      ref: "Organisation",
      required: true
    },

    jobId: {
      type: Schema.Types.ObjectId,
      ref: "Job",
      required: true
    },

    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["Applied", "Interviewing", "Hired", "Rejected"],
      default: "Applied"
    }
  },
  { timestamps: true }
);

module.exports = model("Candidate", CandidateSchema);
