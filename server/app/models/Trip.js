const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema({
  providerId: { type: mongoose.Schema.Types.ObjectId, ref: "Provider", required: true },
  mode: { type: String, enum: ["bus", "train", "flight"], required: true },
  source: { type: String, required: true },
  destination: { type: String, required: true },
  departureTime: { type: Date, required: true },
  arrivalTime: { type: Date, required: true },
  basePrice: { type: Number, required: true },
  dynamicPricing: {
    multiplier: { type: Number, default: 1.0 },
    lastUpdated: { type: Date, default: Date.now }
  },
  totalSeats: { type: Number, required: true },
  availableSeats: { type: Number, required: true },
  status: { type: String, enum: ["scheduled", "cancelled", "completed"], default: "scheduled" }
}, { timestamps: true });

tripSchema.index({ source: 1, destination: 1, departureTime: 1 });

const Trip =  mongoose.model("Trip", tripSchema);

module.exports = {Trip}

