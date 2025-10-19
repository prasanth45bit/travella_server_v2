const mongoose = require('mongoose');

const DayPlanSchema = new mongoose.Schema({
  day: Number,
  description: String,
  activities: [
    {
      name: String,
      time: String,
      details: String,
      image: String,
    }
  ],
});

const DestinationSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  country: String,
  state: String,
  city: String,
  description: String,
  images: [String],
  bestSeason: String,
  tags: [String],
  itinerary: [DayPlanSchema], // daywise plans
  topAttractions: [String],
  mapLocation: {
    lat: Number,
    lng: Number,
    link: String
  },
  createdByAdmin: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Destination', DestinationSchema);
