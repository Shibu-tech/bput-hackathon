const jwt = require('../utils/jwt');
const ApiError = require('../utils/ApiError');

let io;

/**
 * Initialize Socket.IO
 */
const initSocketIO = (server) => {
  io = require('socket.io')(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  global.chatIO = io;

  // Optional authentication check: allow unauthenticated or authenticated chat in dev
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      if (token) {
        const decoded = jwt.verifyToken(token);
        socket.userId = decoded.userId;
      }
      next();
    } catch (error) {
      // Don't abort connection so chat works seamlessly
      next();
    }
  });

  io.on('connection', (socket) => {
    // Join user-specific room
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Chat specific rooms
    socket.on('chat:join', (data) => {
      if (data && data.studentId) {
        socket.join(`chat:${data.studentId}`);
      }
      if (data && data.isWarden) {
        socket.join('warden-room');
      }
    });

    socket.on('chat:send', (msgData) => {
      if (msgData && msgData.studentId) {
        io.to(`chat:${msgData.studentId}`).emit('chat:receive', msgData);
        io.to('warden-room').emit('chat:receive', msgData);
        socket.broadcast.emit('chat:receive', msgData);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {});
  });

  return io;
};

const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(`user:${userId}`).emit(event, data);
  }
};

const emitToRole = (role, event, data) => {
  if (io) {
    io.to(`role:${role}`).emit(event, data);
  }
};

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
