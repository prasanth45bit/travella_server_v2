const router = require('express').Router();
const Booking = require('../models/Booking');
const Destination = require('../models/Destination');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// JWT user middleware
const verifyUser = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// POST: Create new booking with custom day-wise plan, optional hotel and car
router.post('/', verifyUser, async (req, res) => {
  try {
    const { destinationId, customPlan, hotel, carRental } = req.body;
    const destination = await Destination.findById(destinationId);
    if (!destination) return res.status(404).json({ message: 'Destination not found' });
    const newBooking = new Booking({
      user: req.user._id,
      destination: destination._id,
      customPlan,
      hotel: hotel ? hotel : undefined,
      carRental: carRental ? carRental : undefined
    });
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET: User's bookings
router.get('/', verifyUser, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('destination')
      .populate('hotel.hotelId')
      .populate('carRental.carRentalId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET: Single booking by id if user owns it
router.get('/:id', verifyUser, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('destination')
      .populate('hotel.hotelId')
      .populate('carRental.carRentalId');
    if (!booking || booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(booking);
  } catch (err) {
    res.status(404).json({ message: 'Booking not found' });
  }
});

module.exports = router;
