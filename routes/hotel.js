const router = require('express').Router();
const Hotel = require('../models/Hotel');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

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

// Get all hotels
router.get('/', async (req, res) => {
  try { res.json(await Hotel.find()); }
  catch (err) { res.status(500).json({ message: err.message }); }
});


// Get car rentals by destination ID (separate endpoint)
router.get('/destination/:destinationId', async (req, res) => {
  try {
    const hotel = await Hotel.find({ destination: req.params.destinationId });

    if (!hotel || hotel.length === 0) {
      return res.status(404).json({ message: 'No Hotels found for this destination' });
    }

    res.status(200).json(hotel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// Get hotel by id
router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create hotel (admin only)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const hotel = new Hotel(req.body);
    await hotel.save();
    res.status(201).json(hotel);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update hotel (admin only)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json(hotel);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete hotel (admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const hotel = await Hotel.findByIdAndDelete(req.params.id);
    if (!hotel) return res.status(404).json({ message: 'Hotel not found' });
    res.json({ message: 'Hotel deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
