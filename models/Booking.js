const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  place: { type: mongoose.Schema.Types.ObjectId, ref: 'Place' }, // ref to Place
  name: String, // fallback if not using place
  time: String,
  notes: String,
  image: String
});

const DayWisePlanSchema = new mongoose.Schema({
  day: Number,
  title: String,
  activities: [ActivitySchema]
});

const BookingSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  destination: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination', required: true },
  customPlan: [DayWisePlanSchema],
  hotel: {
    hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' },
    roomType: String,
    checkIn: Date,
    checkOut: Date,
    price: Number
  },
  carRental: {
    carRentalId: { type: mongoose.Schema.Types.ObjectId, ref: 'CarRental' },
    carType: String,
    pickupDate: Date,
    dropoffDate: Date,
    price: Number
  },
  status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  bookingDate: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
