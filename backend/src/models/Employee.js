const mongoose = require('mongoose')
const {Schema, model} = mongoose

const EmployeeSchema = new Schema (
    {
        organisationId: {
            type: Schema.Types.ObjectId,
            ref: "Organisation",
            required: true
        },
        firstName: {type: String, required: true},
        lastName: {type: String, required: true},
        email: {type: String, required: true},
        phone: {type: String}
    },
    {timestamps: true}
)

module.exports = model("Employee", EmployeeSchema)