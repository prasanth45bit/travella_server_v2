const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const destinationRoutes = require('./routes/destination');
const bookingRoutes = require('./routes/booking');
const hotelRoutes = require('./routes/hotel');
const carRentalRoutes = require('./routes/carrental');
const placeRoutes = require('./routes/place');
const aiChatRouter =  require('./routes/aichat.js');

dotenv.config();

const app = express();

// Enable CORS
app.use(cors({
  origin: '*', // Allow requests from any origin
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/carrentals', carRentalRoutes);
app.use('/api/places', placeRoutes);
app.use("/api/chat", aiChatRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));