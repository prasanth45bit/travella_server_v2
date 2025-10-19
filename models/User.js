const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String },
  firstName: { type: String },
  lastName: { type: String },
  profilePic: { type: String },
  phoneNumber: { type: String },
  country: { type: String },
  dateOfBirth: { type: Date },
  gender: { type: String, enum: ['male', 'female', 'other'] },

  // Travel-specific fields
  savedDestinations: [
    {
      destinationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Destination' },
      name: String,
      image: String,
      country: String
    }
  ],
  bookings: [
    {
      bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
      type: { type: String, enum: ['flight', 'hotel', 'tour', 'car'] },
      startDate: Date,
      endDate: Date,
      status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' }
    }
  ],
  reviews: [
    {
      reviewId: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
      destination: String,
      rating: Number,
      comment: String,
      date: { type: Date, default: Date.now }
    }
  ],
  notifications: [
    {
      title: String,
      message: String,
      timestamp: { type: Date, default: Date.now },
      isRead: { type: Boolean, default: false }
    }
  ],
  preferences: {
    travelMode: { type: String, enum: ['solo', 'family', 'business', 'couple'], default: 'solo' },
    budgetRange: { min: Number, max: Number },
    preferredActivities: [String],
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'USD' }
  },

  isVerified: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  lastLogin: { type: Date },
  accountStatus: { type: String, enum: ['active', 'suspended', 'deleted'], default: 'active' }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
