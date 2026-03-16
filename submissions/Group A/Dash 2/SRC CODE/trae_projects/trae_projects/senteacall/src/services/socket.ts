
import { io, Socket } from 'socket.io-client';

const URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const socket: Socket = io(URL, {
  autoConnect: false,
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};
