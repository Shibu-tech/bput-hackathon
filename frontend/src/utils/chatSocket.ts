import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export const getChatSocket = (): Socket => {
  if (!socket) {
    socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000
    });

    socket.on('connect', () => {
      console.log('[ChatSocket] Connected to server with ID:', socket?.id);
    });

    socket.on('disconnect', (reason) => {
      console.log('[ChatSocket] Disconnected:', reason);
    });
  }
  return socket;
};
