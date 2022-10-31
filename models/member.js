const mongoose =require('mongoose');

const voluneerData= new mongoose.Schema({
    password: {
    type: String,
    required: true,
  },
  membershipId: {
    type: Number,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  role: {
    type: String,
    required: true,
  },

});

module.exports= mongoose.model( "volunteerData", voluneerData);