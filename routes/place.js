const router = require('express').Router();
const Place = require('../models/Place');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const verifyAdmin = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'No token provided' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
    req.user = user; next();
  } catch { res.status(401).json({ message: 'Invalid token' }); }
};

// List all places (optional filter by destination)
router.get('/', async (req, res) => {
  try {
    const q = req.query.destination ? { destination: req.query.destination } : {};
    const places = await Place.find(q);
    res.json(places);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get one place
router.get('/:id', async (req, res) => {
  try {
    const place = await Place.findById(req.params.id);
    if (!place) return res.status(404).json({ message: 'Place not found' });
    res.json(place);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create place (admin)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    const place = new Place(req.body);
    await place.save();
    res.status(201).json(place);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update place (admin)
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    const place = await Place.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!place) return res.status(404).json({ message: 'Place not found' });
    res.json(place);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete place (admin)
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    const place = await Place.findByIdAndDelete(req.params.id);
    if (!place) return res.status(404).json({ message: 'Place not found' });
    res.json({ message: 'Place deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
