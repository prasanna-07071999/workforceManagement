const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const ProjectMemberSchema = new Schema(
  {
    projectId: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true
    },

    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

ProjectMemberSchema.index(
  { projectId: 1, userId: 1 },
  { unique: true }
);

module.exports = model("ProjectMember", ProjectMemberSchema);
