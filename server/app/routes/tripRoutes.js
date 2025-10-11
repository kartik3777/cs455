const express = require("express");
const tripController = require("../controllers/tripController");
const { protect } = require("../controllers/userauthController");

const router = express.Router();

// Only logged-in providers can add trips
router.post("/add", tripController.addTrip);
// Get all available trips (public)
router.get("/all", tripController.getAllTrips);
router.get("/flights", tripController.getAvailableFlights);
router.get("/trains", tripController.getAvailableTrains);
router.get("/buses", tripController.getAvailableBuses);
 
// Get trips of the logged-in provider
router.get("/provider/:id", tripController.getProviderTrips);

// ✅ Get a single trip by ID
router.get("/:id", tripController.getTripById);

// ✅ Update a trip by ID
router.put("/:id", tripController.updateTrip);

// Delete (cancel) a trip (provider only)
router.delete("/:id", tripController.deleteTrip);

module.exports = router;
