const mongoose = require("mongoose");

const BookingSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  service: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  userEmail: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Completed"],
    default: "Pending",
  },
});

module.exports = mongoose.model("Booking", BookingSchema);