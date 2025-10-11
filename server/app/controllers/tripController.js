const tripModel = require("../models/Trip");
const providerModel = require('../models/Provider')
const catchAsync = require("../utils/catchAsync");


//  Add a new trip (Provider)
exports.addTrip = catchAsync(async (req, res, next) => {
  const { mode, source, destination, departureTime, arrivalTime, basePrice, totalSeats,providerId } = req.body;

  const provider = await providerModel.Provider.findOne({ _id: providerId });
  if (!provider) {
    return res.status(403).json({ message: "Only providers can add trips!" });
  }

  const newTrip = await tripModel.Trip.create({
    providerId: provider._id,
    mode,
    source,
    destination,
    departureTime,
    arrivalTime,
    basePrice,
    totalSeats,
    availableSeats: totalSeats
  });

  res.status(201).json({
    status: "success",
    message: "Trip added successfully",
    data: { trip: newTrip }
  });
});


//  Get all trips (for customers/public)
exports.getAllTrips = catchAsync(async (req, res, next) => {
  const trips = await tripModel.Trip.find({ status: "scheduled" }).populate("providerId", "companyName rating");
  res.status(200).json({
    status: "success",
    results: trips.length,
    data: { trips }
  });
});

// Helper to get trips by mode
const getTripsByMode = async (mode) => {
  const trips = await tripModel.Trip.find({
    mode,
    status: "scheduled",
    availableSeats: { $gt: 0 },
  }).populate("providerId", "companyName rating")
    .sort({ departureTime: 1 });

  return trips;
};

// Flights
exports.getAvailableFlights = catchAsync(async (req, res, next) => {
  const flights =  await getTripsByMode("flight");
  res.status(200).json({
    status: "success",
    results: flights.length,
    data: { trips: flights }
  });
});

// Trains
exports.getAvailableTrains = catchAsync(async (req, res, next) => {
  const trains =  await getTripsByMode("train");
  res.status(200).json({
    status: "success",
    results: trains.length,
    data: { trips: trains }
  });
});

// Buses
exports.getAvailableBuses = catchAsync(async (req, res, next) => {
  const buses =await getTripsByMode("bus");
  res.status(200).json({
    status: "success",
    results: buses.length,
    data: { trips: buses }
  });
});

//  Get all trips of a specific provider
exports.getProviderTrips = catchAsync(async (req, res, next) => {
  const provider = await providerModel.Provider.findOne({ _id: req.params.id });
  if (!provider) {
    return res.status(403).json({ message: "Provider not found!" });
  }

  const trips = await tripModel.Trip.find({ providerId: provider._id });
  res.status(200).json({
    status: "success",
    results: trips.length,
    data: { trips }
  });
});


// ✅ Get a single trip by ID
exports.getTripById = async (req, res) => {
  try {
    console.log("id: "+req.params.id);
    
    const trip = await tripModel.Trip.findById(req.params.id).populate("providerId", "name rating");

    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.status(200).json({ success: true, data: trip });
  } catch (error) {
    console.error("Error fetching trip:", error);
    res.status(500).json({ message: "Server error while fetching trip" });
  }
};

// ✅ Update trip details
exports.updateTrip = async (req, res) => {
  try {
    const { id } = req.params;

    // Allowed fields to update
    const updateFields = [
      "source",
      "destination",
      "mode",
      "departureTime",
      "arrivalTime",
      "totalSeats",
      "availableSeats",
      "basePrice",
    ];

    const updates = {};
    updateFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const updatedTrip = await tripModel.Trip.findByIdAndUpdate(id, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedTrip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    res.status(200).json({
      success: true,
      message: "Trip updated successfully",
      data: updatedTrip,
    });
  } catch (error) {
    console.error("Error updating trip:", error);
    res.status(500).json({ message: "Server error while updating trip" });
  }
};

//  Delete (or cancel) a trip
exports.deleteTrip = catchAsync(async (req, res, next) => {
  // const provider = await providerModel.Provider.findOne({ _id: req.params.id });
  // if (!provider) {
  //   return res.status(403).json({ message: "Unauthorized provider!" });
  // }
 console.log('====================================');
 console.log(req.params.id);
 console.log('====================================');
  const trip = await tripModel.Trip.findByIdAndDelete(req.params.id);

  if (!trip) {
    return res.status(404).json({ message: "Trip not found or not owned by you!" });
  }

  res.status(200).json({
    status: "success",
    message: "Trip deleted successfully"
  });
});
