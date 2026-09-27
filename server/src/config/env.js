require('dotenv').config();

module.exports = {
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/fretbox',
  jwtSecret: process.env.JWT_SECRET || 'fallback-secret',
  qrTokenSecret: process.env.QR_TOKEN_SECRET || 'fallback-qr-secret',
  clientOrigin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  vapidPublicKey: process.env.VAPID_PUBLIC_KEY || '',
  vapidPrivateKey: process.env.VAPID_PRIVATE_KEY || '',
  vapidSubject: process.env.VAPID_SUBJECT || 'mailto:you@example.com',
  timezone: process.env.TZ || 'Asia/Kolkata'
};