const mongoose = require('mongoose');

const PlaceSchema = new mongoose.Schema({
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
  name: { type: String, required: true },
  description: String,
  images: [String],
  address: String,
  lat: Number,
  lng: Number,
  category: [String], // museum, park etc
  openHours: String,
  recommendedTimeMinutes: Number
}, { timestamps: true });

module.exports = mongoose.model('Place', PlaceSchema);
