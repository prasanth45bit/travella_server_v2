const mongoose = require('mongoose');

const CarrentalSchema = new mongoose.Schema({
  provider: { type: String, required: true },
  destination: { type: String, ref: 'Destination', required: true },
  carType: String, // e.g., Sedan, SUV
  carModel: String,
  pricePerDay: { type: Number, required: true },
  features: [String],
  images: [String],
  location: String,
  availability: [{
    startDate: Date,
    endDate: Date
  }],
});

module.exports = mongoose.model('Carrental', CarrentalSchema);
