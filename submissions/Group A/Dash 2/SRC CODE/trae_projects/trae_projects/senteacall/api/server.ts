
/**
 * local server entry file, for local development
 */
import app from './app.js';
import { createServer } from 'http';
import { initSocket } from './services/socketService.js';

/**
 * start server with port
 */
const PORT = process.env.PORT || 3001;

// Create HTTP server from Express app
const httpServer = createServer(app);

// Initialize Socket.io
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server ready on port ${PORT}`);
});

/**
 * close server
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  httpServer.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.once('SIGUSR2', () => {
  httpServer.close(() => {
    process.kill(process.pid, 'SIGUSR2');
  });
});

export default app;
