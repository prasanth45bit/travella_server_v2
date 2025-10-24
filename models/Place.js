const mongoose = require('mongoose');

const placeSchema = new mongoose.Schema({
  destination: { type: String, ref: 'Destination', required: true },
  place_name: {
    type: String,
    required: true,
  },
  description: String,
  destination_name: String,
  category: String,
  time_slot: {
    type: String,
    enum: ["morning", "afternoon", "evening"],
    required: true,
  },
  rating: {
    type: Number,
    default: 4.0,
  },
  price: {
    type: Number,
    default: 0,
  },
  duration_hours: {
    type: Number,
    default: 2.0,
  },
  location: {
    lat: Number,
    lng: Number,
  },
  image_url: String,
  best_season: String,
  is_popular: {
    type: Boolean,
    default: false,
  }
}, {
  timestamps: true,
});

module.exports = mongoose.model('Place', placeSchema);
