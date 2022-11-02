const mongoose = require('mongoose');

const foodItems= mongoose.Schema({
    name:{
        type: 'string',
        required: true,
    },
    price:{
        type:Number,
        required: true,
    },

    canteenId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "canteenData",
        required: true,
    }
});

module.exports= mongoose.model('foodItems', foodItems);