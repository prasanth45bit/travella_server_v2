const express = require("express");
const Place = require('../models/Place');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const router = express.Router();

// 🔒 Verify Admin Middleware
const verifyAdmin = async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user || user.role !== "admin")
      return res.status(403).json({ message: "Admin only" });

    req.user = user;
    next();
  } catch (err) {
    res.status(401).json({ message: "Invalid token" });
  }
};

// 📍 Get all places
router.get("/", async (req, res) => {
  try {
    const places = await Place.find().populate("destination", "name _id");
    res.json(places);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 📍 Get places by destination ID
router.get("/destination/:destinationId", async (req, res) => {
  try {
    const destId = req.params.destinationId;

    if (!destId)
      return res.status(400).json({ message: "Invalid destination ID" });

    const places = await Place.find({ destination: destId }).populate(
      "destination",
      "name _id"
    );
    res.json(places);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 📍 Get single place by ID
router.get("/:id", async (req, res) => {
  try {
    const place = await Place.findById(req.params.id).populate(
      "destination",
      "name _id"
    );
    if (!place) return res.status(404).json({ message: "Place not found" });
    res.json(place);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// 🆕 Create place (Admin only)
router.post("/", verifyAdmin, async (req, res) => {
  try {
    const { destination, place_name, time_slot } = req.body;

    if (!destination || !place_name || !time_slot) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const place = new Place(req.body);
    await place.save();

    const populated = await Place.findById(place._id).populate(
      "destination",
      "name _id"
    );

    res.status(201).json(populated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ✏️ Update place (Admin only)
router.put("/:id", verifyAdmin, async (req, res) => {
  try {
    const place = await Place.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    }).populate("destination", "name _id");

    if (!place) return res.status(404).json({ message: "Place not found" });
    res.json(place);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// ❌ Delete place (Admin only)
router.delete("/:id", verifyAdmin, async (req, res) => {
  try {
    const place = await Place.findByIdAndDelete(req.params.id);
    if (!place) return res.status(404).json({ message: "Place not found" });
    res.json({ message: "Place deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
