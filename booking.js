const express = require("express");
const auth = require("../middleware/auth");
const Booking = require("../models/Booking");
const router = express.Router();

// Utility function for error responses
const handleError = (res, statusCode, message) => {
  return res.status(statusCode).json({ error: message });
};

//! Get all bookings for the authenticated user
router.get("/", auth, async (req, res) => {
  try {
    //* Fetch all bookings for the authenticated user
    const bookings = await Booking.find({ user: req.user.id });
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    handleError(res, 500, "Server error");
  }
});

//! Create a new booking
router.post("/", auth, async (req, res) => {
  const { service, date, userEmail, notes } = req.body;

  try {
    const existingBookings = await Booking.find({ date });
    if (existingBookings.length >= 3) {
      return handleError(res, 400, "Maximum bookings reached for this date");
    }

    const newBooking = new Booking({
      user: req.user.id,
      service,
      date,
      userEmail,
      notes,
    });

    const booking = await newBooking.save();
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    handleError(res, 500, "Server error");
  }
});

//! Update a booking
router.put("/:id", auth, async (req, res) => {
  const { service, date, notes } = req.body;
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return handleError(res, 404, "Booking not found");
    }

    if (booking.user.toString() !== req.user.id) {
      return handleError(res, 401, "Not authorized");
    }

    booking.service = service || booking.service;
    booking.date = date || booking.date;
    booking.notes = notes || booking.notes;

    await booking.save();
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    handleError(res, 500, "Server error");
  }
});

//! Delete a booking
router.delete("/:id", auth, async (req, res) => {
  try {
    let booking = await Booking.findById(req.params.id);

    if (!booking) {
      return handleError(res, 404, "Booking not found");
    }

    if (booking.user.toString() !== req.user.id) {
      return handleError(res, 401, "Not authorized");
    }

    await Booking.findByIdAndDelete(req.params.id);
    res.json({ msg: "Booking removed" });
  } catch (err) {
    console.error(err.message);
    handleError(res, 500, "Server error");
  }
});

//! Search bookings
router.get("/search", async (req, res) => {
  const { search } = req.query;

  try {
    const query = {};
    if (search) {
      const keywords = search.split(" ");
      keywords.forEach((keyword) => {
        if (keyword.includes(":")) {
          const [key, value] = keyword.split(":");
          query[key.trim()] = value.trim();
        }
      });
    }

    const bookings = await Booking.find(query);
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    handleError(res, 500, "Server error");
  }
});

module.exports = router;