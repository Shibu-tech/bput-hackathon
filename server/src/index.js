const http = require('http');
const { app, connectDB } = require('./app');
const { initSocketIO } = require('./sockets');
const { startJobs } = require('./jobs');
const { syncGridFsToSupabase } = require('./services/supabase.service');
require('dotenv').config();

const PORT = process.env.PORT || 5000;

// Start server
const startServer = async () => {
  try {
    // Connect to database first
    await connectDB();
    console.log('MongoDB connected successfully');

    // Run non-blocking GridFS-to-Supabase migration sync
    syncGridFsToSupabase().catch((syncErr) => {
      console.warn('Startup GridFS sync notice:', syncErr.message);
    });

    // Create HTTP server and socket layer
    const server = http.createServer(app);
    initSocketIO(server);

    // Start scheduled jobs after DB connection
    startJobs();

    // Start server
    server.listen(PORT, () => {
      console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
    });

    // Handle uncaught exceptions and unhandled promise rejections gracefully
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception logged:', err);
    });

    process.on('unhandledRejection', (err) => {
      console.error('Unhandled rejection logged:', err);
    });

    process.on('exit', (code) => {
      console.log(`Server process exiting with code: ${code}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();