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

// JWT admin middleware
const verifyAdmin = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Admin access only' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// POST: Create a new booking
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
    } = req.body;

    let totalCost = 0;
    // Calculate total cost from customPlan
    if (Array.isArray(customPlan)) {
      totalCost = customPlan.reduce((acc, day) => {
        if (day.Hotel && day.Hotel.perDay) {
          acc += day.Hotel.perDay;
        }
        return acc;
      }
      , 0);
    }

    const userId = req.user._id;
    // Basic validation
    if (!userId || !destinationId || !startDate || !endDate || !customPlan) {
      return res.status(400).json({ message: 'Missing required fields' });
    }


    const newBooking = await new Booking({
      userId,
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
    console.log(req.user._id);
    const bookings = await Booking.find({ userId: req.user._id })
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

router.delete('/:id', verifyUser, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking || booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }
    await booking.remove();
    res.json({ message: 'Booking deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
  });


module.exports = router;
