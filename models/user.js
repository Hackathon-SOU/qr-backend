const mongoose= require("mongoose");

const userData= new mongoose.Schema({
    name: {
    type: String,
    required: true,
  },
  regId: {
    type: Number,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  seatNo: {
    type: Number,
    index: {
      unique: true,
      partialFilterExpression: {
        seatNo: {
          $type: "number",
        },
      },
    },
  },
  present: {
    type: Boolean,
    required: true,
  },
  points:{
    type: Number,
    required: true,
    default:100,
  },
  eventId:{
    type: mongoose.Schema.Types.ObjectId,
  }
});

module.exports= mongoose.model("userData", userData)