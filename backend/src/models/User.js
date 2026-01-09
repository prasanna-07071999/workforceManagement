const mongoose = require('mongoose')
const Organisation = require('./Organisation')
const {Schema, model} = mongoose

const UserSchema = new Schema(
    {
        organisationId:{
            type: Schema.Types.ObjectId,
            ref: "Organisation",
            required: true
        },
        email: {type: String, required: true, unique: true},
        passwordHash: {type: String, required: true},
        name: {type: String, required: true},
        isAdmin: {type: Boolean, default: false},
        mustChangePassword: {type: Boolean, default: false},
        status: {
            type: String,
            enum: ["Active", "Inactive", "Resigned"],
            default: "Active"
        }
    },
    {timestamps: true}
)

module.exports = model("User", UserSchema)

