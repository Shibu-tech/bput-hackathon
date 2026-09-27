const jwt = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

let io;

/**
 * Initialize Socket.IO
 */
const initSocketIO = (server) => {
  io = require('socket.io')(server, {
    cors: {
      origin: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
      methods: ['GET', 'POST']
    }
  });

  // Authenticate socket connections using JWT
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new ApiError(401, 'Authentication error'));
      }

      const decoded = jwt.verifyToken(token);
      socket.userId = decoded.userId;
      next();
    } catch (error) {
      return next(new ApiError(401, 'Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.userId}`);

    // Join user-specific room
    socket.on('join-user-room', () => {
      socket.join(`user:${socket.userId}`);
      console.log(`User ${socket.userId} joined user room`);
    });

    // Join role-specific room
    socket.on('join-role-room', (role) => {
      socket.join(`role:${role}`);
      console.log(`User ${socket.userId} joined role room: ${role}`);
    });

    // Join hostel-specific room
    socket.on('join-hostel-room', (hostel) => {
      socket.join(`hostel:${hostel}`);
      console.log(`User ${socket.userId} joined hostel room: ${hostel}`);
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.userId}`);
    });
  });

  return io;
};

/**
 * Emit to user-specific room
 */
const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

/**
 * Emit to role-specific room
 */
const emitToRole = (role, event, data) => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
};

/**
 * Emit to hostel-specific room
 */
const emitToHostel = (hostel, event, data) => {
  if (io) {
    io.to(`hostel:${hostel}`).emit(event, data);
  }
};

module.exports = {
  initSocketIO,
  emitToUser,
  emitToRole,
  emitToHostel
};