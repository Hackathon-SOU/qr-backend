const mongoose = require('mongoose');

const eventData = new mongoose.Schema({
    eventName: {
        type: String,
        required: true
    },
    eventDate: {
        type: Number,
        required: true,
        unique: true,
        validate: {
            validator: function (val) {
                return val.toString().length === 10
            },
            message: val => `${val.value} has to be 10 digits`
        }
    },
    eventType: {
        type: String,
        requied: true,
        enum: ['technical', 'non-technical']
    }
});

module.exports = mongoose.model("eventData", eventData);