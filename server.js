const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const axios = require('axios');

const authRoutes = require('./routes/auth');
const destinationRoutes = require('./routes/destination');
const bookingRoutes = require('./routes/booking');
const hotelRoutes = require('./routes/hotel');
const carRentalRoutes = require('./routes/carrental');
const placeRoutes = require('./routes/place');
const aiChatRouter = require('./routes/aichat.js');

dotenv.config();

const app = express();


// ------------------ Middleware ------------------
app.use(cors({
  origin: '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization','token']
}));

app.use(express.json());

// ------------------ MongoDB Connection ------------------
mongoose.connect(process.env.MONGO_URL, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected'))
  .catch((err) => console.error('MongoDB connection error:', err));

// ------------------ Routes ------------------
app.use('/api/auth', authRoutes);
app.use('/api/destinations', destinationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/carrentals', carRentalRoutes);
app.use('/api/places', placeRoutes);
app.use('/api/chat', aiChatRouter);

// ------------------ API Scheduler ------------------
// (Optional: store these in .env for flexibility)
const API_1 = 'https://travella-ai.onrender.com/';
const API_2 = 'https://travella-ai.vercel.app/';
const API_3 = 'https://travella-server-v2.onrender.com/api/destinations';

// Simple flag to prevent overlapping runs
let isRunning = false;

async function callApis() {
  if (isRunning) {
    console.log('⏸️ Skipping — previous API call still running...');
    return;
  }

  isRunning = true;
  console.log(`[${new Date().toLocaleString()}] 🔁 Starting API calls...`);

  try {
    const [res1, res2, res3] = await Promise.all([
      axios.get(API_1),
      axios.get(API_2),
      axios.get(API_3),
    ]);

    console.log('✅ API 1:', res1.status);
    console.log('✅ API 2:', res2.status);
    console.log('✅ API 3:', res3.status);
  } catch (error) {
    console.error('❌ Error calling APIs:', error.message);
  }

  isRunning = false;
  console.log('✅ API cycle complete.\n');
}

// Run immediately on server start
callApis();

// Schedule every 20 minutes (20 * 60 * 1000 = 1,200,000 ms)
setInterval(callApis, 15 * 60 * 1000);

// ------------------ Start Server ------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
