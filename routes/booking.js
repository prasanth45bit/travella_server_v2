const router = require('express').Router();
const Booking = require('../models/Booking');
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


// controllers/bookingController.js
router.post('/', verifyUser, async (req, res) => {
  try {
    const {
      destinationId,
      guests,
      startDate,
      endDate,
      customPlan,
      hotel,
      car,
      totalCost,
    } = req.body;

    const user = req.user._id;
    // Basic validation
    if (!user || !destinationId || !startDate || !endDate || !customPlan) {
      return res.status(400).json({ message: 'Missing required fields' });
    }


    const newBooking = await new Booking({
      user,
      destinationId,
      guests,
      startDate,
      endDate,
      customPlan,
      hotel,
      car,
      totalCost,
    });

    const savedBooking = await newBooking.save();

    res.status(201).json({
      message: 'Booking created successfully',
      booking: savedBooking,
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}
);


// GET: User's bookings
router.get('/', verifyUser, async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id })
      .populate('destinationId')
      .populate('hotel.hotelId')
      .populate('car.carId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET: Single booking by id if user owns it
router.get('/:id', verifyUser, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('destinationId')
      .populate('hotel.hotelId')
      .populate('car.carId');
    if (!booking || booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(booking);
  } catch (err) {
    res.status(404).json({ message: 'Booking not found' });
  }
});

module.exports = router;
