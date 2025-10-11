const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  tripId: { type: mongoose.Schema.Types.ObjectId, ref: "Trip", required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  passengerDetails: [{
    name: { type: String, required: true },
    age: { type: Number, required: true, min: 0 },
    gender: { type: String, enum: ["M", "F", "O"], required: true }
  }],
  seatNumbers: [{ type: Number, required: true }],
  pricePaid: { type: Number, required: true },
  paymentStatus: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
  bookingStatus: { type: String, enum: ["active", "cancelled", "rescheduled"], default: "active" },
  penaltyApplied: { type: Number, default: 0 }
}, { timestamps: true });


const Booking = mongoose.model('Booking',bookingSchema)

module.exports = {Booking}
// module.exports = mongoose.model("Booking", bookingSchema);
