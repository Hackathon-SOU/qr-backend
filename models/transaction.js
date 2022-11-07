const mongoose = require("mongoose");


const transactionData = new mongoose.Schema({
    canteenId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'canteenData',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'userData',
        required: true,
    },
    foodItems: [{
        foodItemId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "foodItem"
        },
        quantity: {
            type: Number,
            required: true
        }
    }],
    price: {
        type: Number,
        required: true
    }
});

module.exports = mongoose.model('transactionData', transactionData)