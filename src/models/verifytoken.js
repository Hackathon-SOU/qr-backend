const mongoose = require("mongoose");

const tokenSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "volunteerData",
        require: true
    },
    token: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('tokenSchema', tokenSchema);