const router = require('express').Router();
const CarRental = require('../models/CarRental');
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

// Get all car rentals
router.get('/', async (req, res) => {
  try { res.json(await CarRental.find()); }
  catch (err) { res.status(500).json({ message: err.message }); }
});

// Get car rental by id
router.get('/:id', async (req, res) => {
  try {
    const car = await CarRental.findById(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car rental not found' });
    res.json(car);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create car rental (admin only)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const car = new CarRental(req.body);
    await car.save();
    res.status(201).json(car);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update car rental (admin only)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const car = await CarRental.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!car) return res.status(404).json({ message: 'Car rental not found' });
    res.json(car);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete car rental (admin only)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const car = await CarRental.findByIdAndDelete(req.params.id);
    if (!car) return res.status(404).json({ message: 'Car rental not found' });
    res.json({ message: 'Car rental deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
