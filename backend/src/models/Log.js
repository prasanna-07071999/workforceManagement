const mongoose = require('mongoose')
const {Schema, model} = mongoose

const LogSchema = new Schema(
  {
    organisationId: { type: Schema.Types.ObjectId, ref: "Organisation", default: null },
    userId: { type: Schema.Types.ObjectId, ref: "User", default: null },
    action: { type: String, required: true },
    event: { type: String, default: null },
    status: { type: Number, default: null },
    ip: { type: String, default: null },
    timestamp: { type: Date, default: Date.now }
  },
  { timestamps: true }
);

module.exports = model('Log', LogSchema)