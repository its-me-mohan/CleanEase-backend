
const Booking = require('../models/Booking');

//! Create a new booking
exports.createBooking = async (req, res) => {
  const { service, date } = req.body;

  try {
    const newBooking = new Booking({
      user: req.user.id,
      service,
      date,
    });

    const booking = await newBooking.save();
    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

//! Get all bookings for the current user
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id }).sort({ date: -1 });
    res.json(bookings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

//! Update a booking
exports.updateBooking = async (req, res) => {
  const { service, date, status } = req.body;

  try {
    let booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ msg: 'Booking not found' });

    // Ensure the user owns the booking
    if (booking.user.toString() !== req.user.id)
      return res.status(401).json({ msg: 'User not authorized' });

    booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { $set: { service, date, status } },
      { new: true }
    );

    res.json(booking);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};