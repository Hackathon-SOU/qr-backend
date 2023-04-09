const mongoose = require("mongoose");

const userData = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    // unique: true,
  },
  points: {
    type: Number,
    required: true,
    default: 100,
  },
});

module.exports = mongoose.model("userData", userData);
