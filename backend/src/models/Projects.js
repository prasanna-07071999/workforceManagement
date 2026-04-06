const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const ProjectSchema = new Schema(
  {
    organisationId: {
      type: Schema.Types.ObjectId,
      ref: "Organisation",
      required: true
    },

    name: {
      type: String,
      required: true
    },

    description: {
      type: String
    },

    status: {
      type: String,
      enum: ["Upcoming", "Active", "Completed"],
      default: "Upcoming"
    },

    startDate: {
      type: String
    },

    endDate: {
      type: String
    },
    
    teamId: {
      type: Schema.Types.ObjectId,
      ref: "Team",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = model("Project", ProjectSchema);
