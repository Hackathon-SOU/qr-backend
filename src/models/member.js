const mongoose = require('mongoose');

const volunteerData = new mongoose.Schema({
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
    enum: ['admin', 'volunteer', 'execom', 'super-admin']
  },
  name: {
    type: String,
    required: true
  },
  verified: {
    type: Boolean,
    default: false,
  }
});

module.exports = mongoose.model("volunteerData", volunteerData);