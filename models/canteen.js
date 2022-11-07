const mongoose = require("mongoose");

const canteenData= new mongoose.Schema({
    
    canteenName:{
        type: String,
        required: true,
        unique: true,
    },

    email:{
        type: String,
        unique: true,
        required:true
    },

    phoneNo:{
        type: Number,
        required: true,
        unique: true,
        validate: {
            validator: function(val) {
                return val.toString().length === 10
            },
            message: val => `${val.value} has to be 10 digits`
        }

    },

    ownerName:{
        type: String,
        required: true,
    },

    password:{
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