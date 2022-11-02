const mongoose = require("mongoose");

const canteenData= new mongoose.Schema({
    canteenName:{
        type: String,
        required: true,
        unique: true,
    },
    ownerName:{
        type: String,
        required: true,
    },
    points:{
        type: Number,
        default: 0,
        required: true,
    },
});

module.exports= mongoose.model('canteenData', canteenData);