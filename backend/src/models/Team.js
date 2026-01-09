const mongoose = require('mongoose')
const {Schema, model} = mongoose

const TeamSchema = new Schema(
  {
    organisationId: { type: Schema.Types.ObjectId, ref: "Organisation", required: true },
    name: { type: String, required: true },
    description: { type: String }
  },
  { timestamps: true }
);

module.exports = model('Team', TeamSchema)