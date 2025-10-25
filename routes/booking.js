const router = require('express').Router();
const Booking = require('../models/Booking');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// -------------------- Middleware --------------------

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
    if (!user || user.role !== 'admin')
      return res.status(403).json({ message: 'Admin access only' });
    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// -------------------- Routes --------------------

// ✅ 1️⃣ Admin routes should come first (to avoid conflict with dynamic params)
router.get('/userbookings', verifyAdmin, async (req, res) => {
  try {
    console.log('Admin user:', req.user);
    const userBookings = await Booking.find()
      .populate('userId')
      .populate('destinationId');
    res.json(userBookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true })
      .populate('destinationId')
      .populate('userId');
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const totalBookings = await Booking.countDocuments();
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    res.status(200).json({ totalBookings, pendingBookings });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ 2️⃣ User routes next

// GET: All bookings of current user
router.get('/', verifyUser, async (req, res) => {
  try {
    const bookings = await Booking.find({ userId: req.user._id })
      .populate('destinationId')
      .populate('userId');
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST: Create a new booking
router.post('/', verifyUser, async (req, res) => {
  try {
    const { destinationId, guests, startDate, endDate, customPlan, hotel, car } = req.body;

    let totalCost = 0;
    if (Array.isArray(customPlan)) {
      totalCost = customPlan.reduce((acc, day) => {
        if (day.Hotel && day.Hotel.perDay) acc += day.Hotel.perDay;
        return acc;
      }, 0);
    }

    const userId = req.user._id;

    if (!userId || !destinationId || !startDate || !endDate || !customPlan) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const newBooking = new Booking({
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
    const populatedBooking = await Booking.findById(savedBooking._id)
      .populate('destinationId')
      .populate('userId');

    res.status(201).json({
      message: 'Booking created successfully',
      booking: populatedBooking,
    });
  } catch (error) {
    console.error('Booking creation error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

// GET: Single booking by id (after specific routes!)
router.get('/:id', verifyUser, async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('destinationId')
      .populate('userId');

    if (!booking || booking.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(booking);
  } catch (err) {
    res.status(404).json({ message: 'Booking not found' });
  }
});

// DELETE: Remove a booking (user only)
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

module.exports = router;
