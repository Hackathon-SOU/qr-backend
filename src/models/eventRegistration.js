const mongoose = require("mongoose");

const eventRegistration = new mongoose.Schema({
  regId: {
    type: Number,
    required: true,
    unique: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "eventData",
    required: true,
  },
  seatNo: {
    type: Number,
    unique: true,
    sparse: true,
  },

  present: {
    type: Boolean,
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "userData",
  },
});
eventRegistration.index(
  { eventId: 1, seatNo: 1 },
  { unique: true, partialFilterExpression: { seatNo: { $ne: null, $ne: "" } } }
);
eventRegistration.index({ eventId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model("eventRegistration", eventRegistration);
