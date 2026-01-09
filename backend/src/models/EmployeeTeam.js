const mongoose = require("mongoose");
const {Schema, model} = mongoose

const EmployeeTeamSchema = new Schema(
  {
    employeeId: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    teamId: { type: Schema.Types.ObjectId, ref: "Team", required: true },
    assignedAt: { type: Date, default: Date.now }
  },
  { timestamps: false }
);
EmployeeTeamSchema.index({ employeeId: 1, teamId: 1 }, { unique: true })

module.exports = model("EmployeeTeam", EmployeeTeamSchema)
