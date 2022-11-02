const  mongoose= require('mongoose');

const eventData= new mongoose.Schema({
    eventName:{
        type: String,
        required: true
    },
    eventDate:{
        type: Date,
        requied: true,
    },
    eventType:{
        type: String,
        requied: true,
    }
});

module.exports= mongoose.model("eventData", eventData);