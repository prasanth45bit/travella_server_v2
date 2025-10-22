const mongoose = require('mongoose');

const HotelSchema = new mongoose.Schema({
  name: { type: String, required: true },
  destination: { type: String, ref: 'Destination', required: true },
  address: String,
  city: String,
  country: String,
  pricePerNight: { type: Number, required: true },
  amenities: [String],
  images: [String],
  rooms: [{
    type: String, // e.g., Deluxe, Standard
    available: { type: Number, default: 0 },
    price: Number
  }],
  availability: [{
    startDate: Date,
    endDate: Date,
    numRooms: Number
  }],
});

module.exports = mongoose.model('Hotel', HotelSchema);
