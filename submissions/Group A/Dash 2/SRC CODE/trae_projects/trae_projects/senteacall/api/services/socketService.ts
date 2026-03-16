
import { Server, Socket } from 'socket.io';
import {
  analyzeThreatIncremental,
  createInitialThreatState,
  getRecommendation,
  type ThreatState,
} from './analysisService.js';

let io: Server;

export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"]
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('New client connected:', socket.id);

    let intervalId: NodeJS.Timeout | null = null;
    let threatState: ThreatState = createInitialThreatState();

    const cleanupCall = () => {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }
      threatState = createInitialThreatState();
    };

    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
      cleanupCall();
    });

    socket.on('start_call', async (data: { callerNumber: string, userId: string }) => {
      console.log(`Starting call simulation for user ${data.userId} from ${data.callerNumber}`);
      
      // Ensure previous call is cleaned up
      cleanupCall();

      threatState = createInitialThreatState();

      // Emit initial status
      socket.emit('call_status', { status: 'connected', riskScore: 0, threats: [] });

      const script: Array<{ speaker: 'scammer' | 'user'; text: string }> = [
        { speaker: 'scammer', text: 'Hello' },
        { speaker: 'user', text: 'Hello' },
        { speaker: 'scammer', text: 'This is your bank security department.' },
        { speaker: 'scammer', text: 'We detected suspicious activity on your account.' },
        { speaker: 'scammer', text: 'Please provide the OTP sent to your phone.' },
      ];

      let step = 0;

      intervalId = setInterval(async () => {
        if (!socket.connected) {
          cleanupCall();
          return;
        }

        if (step >= script.length) {
          cleanupCall();
          return;
        }

        const segment = script[step];
        step += 1;

        socket.emit('transcript_update', {
          text: `${segment.speaker}: ${segment.text}`,
          timestamp: new Date().toISOString(),
          isUser: segment.speaker === 'user',
        });

        threatState = await analyzeThreatIncremental(segment.text, threatState);

        socket.emit('risk_update', {
          riskScore: threatState.riskScore,
          threats: Array.from(threatState.threats),
          recommendation: getRecommendation(threatState.riskScore),
        });
      }, 2500);
    });

    socket.on('end_call', () => {
      cleanupCall();
      console.log('Call ended by user');
      socket.emit('call_status', { status: 'ended' });
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized!");
  }
  return io;
};
