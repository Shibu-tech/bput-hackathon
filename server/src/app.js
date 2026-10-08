const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const errorHandler = require('./middleware/errorHandler');
const notFound = require('./middleware/notFound');
const {
  authRoutes,
  ticketRoutes,
  gatePassRoutes,
  noticeRoutes,
  messRoutes,
  attendanceRoutes,
  pushRoutes,
  locationRoutes,
  fileRoutes,
  aiRoutes,
  messageRoutes,
} = require('./routes');

const app = express();

// Middleware
const allowedOrigins = [
  process.env.CLIENT_ORIGIN,
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:5173'
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));

// Body parser with 50mb limit for large documents & Supabase uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/gate-passes', gatePassRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/mess', messRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/marks', marksRoutes);
app.use('/api/notes', noteRoutes);
app.use('/api/push', pushRoutes);
app.use('/api/locations', locationRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/messages', messageRoutes);

// 404 handler
app.use(notFound);

// Error handler (must be last)
app.use(errorHandler);

module.exports = {
  app,
  connectDB
};
