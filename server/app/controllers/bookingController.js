const bookingModel = require("../models/Booking");
const paymentModel = require("../models/Payment");
const tripModel = require("../models/Trip");
const catchAsync = require("../utils/catchAsync");
const mongoose = require("mongoose");

exports.createBooking = catchAsync(async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { tripId, customerId, passengerDetails, seatsBooked, method } = req.body;

    // 1️⃣ Verify trip
    const trip = await tripModel.Trip.findById(tripId).session(session);
    if (!trip) throw new Error("Trip not found");

    // 2️⃣ Check seat availability
    if (trip.availableSeats < seatsBooked) throw new Error("Not enough seats available");

    // 3️⃣ Generate seat numbers automatically
    const seatNumbers = Array.from(
      { length: seatsBooked },
      (_, i) => trip.totalSeats - trip.availableSeats + i + 1
    );

    // 4️⃣ Calculate total price
    const totalAmount = trip.basePrice * seatsBooked;

    // 5️⃣ Create booking
    const booking = await bookingModel.Booking.create(
      [
        {
          tripId,
          customerId,
          passengerDetails,
          seatNumbers,
          pricePaid: totalAmount,
          paymentStatus: "paid",
          bookingStatus: "active",
        },
      ],
      { session }
    );

    // 6️⃣ Create payment
    const payment = await paymentModel.Payment.create(
      [
        {
          bookingId: booking[0]._id,
          amount: totalAmount,
          method,
          transactionId: `TXN-${Date.now()}`,
          status: "success",
        },
      ],
      { session }
    );

    // 7️⃣ Reduce seats in trip
    trip.availableSeats -= seatsBooked;
    await trip.save({ session });

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      status: "success",
      message: "Booking successful",
      booking: booking[0],
      payment: payment[0],
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    res.status(400).json({ status: "fail", message: err.message });
  }
});


// POST /bookings/my
exports.getUserBookings = catchAsync(async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      status: "fail",
      message: "userId is required in request body",
    });
  }

  const bookings = await bookingModel.Booking.find({ customerId: userId })
    .populate({
      path: "tripId",
      populate: { path: "providerId" } // get provider info
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: bookings.length,
    bookings,
  });
});
