const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  destinationId: {
    type: String,
    ref: 'Destination',
    required: true
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  guests: { type: Number, required: true },
  customPlan: [
    {
      day: Number,
      places: [{ type: String, ref: 'Place' }]
    } 
  ],
  hotel: [
    {
      day: Number,
      hotelId: { type: String, ref: 'Hotel' },
      pricePerNight: Number
    }
  ],
  car: {
    carType: String,
    carId: { type: String, ref: 'Carrental' },
    pricePerDay: Number,
    totalDays: Number
  },
  totalCost: Number,
  user: { type: String, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);