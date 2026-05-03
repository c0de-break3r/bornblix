import { Server, Socket } from 'socket.io';
import { getAuth } from '@clerk/express';
import { AppError } from '../middleware/errorHandler';

export const initializeSocket = (io: Server) => {
  io.use((socket: any, next) => {
    try {
      // Simple auth check via headers (Clerk token)
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
      if (!token) {
        return next(new Error('Authentication error'));
      }
      socket.userId = 'demo-user'; // In production, verify Clerk token
      next();
    } catch (err) {
      next(new Error('Socket authentication failed'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log(`🦁 Bōōns connected: ${socket.id} (User: ${(socket as any).userId})`);

    // Join personal room
    socket.join(`user-${(socket as any).userId}`);

    // Real-time chat events (AI Companion + Community)
    socket.on('sendMessage', async (data) => {
      const { chatId, content, type = 'text' } = data;
      
      io.to(`chat-${chatId}`).emit('newMessage', {
        id: Date.now().toString(),
        chatId,
        senderId: (socket as any).userId,
        content,
        type,
        timestamp: new Date(),
        isFromBoon: type === 'ai'
      });
    });

    // AI Companion specific events
    socket.on('askBoon', (question) => {
      // Here you would call your AI service (Vercel AI SDK, Grok, OpenAI, etc.)
      const responses = [
        "The Word says His grace is sufficient for you today. What verse is on your heart?",
        "Bōōns is with you. Would you like me to generate a personalized prayer?",
        "Remember Matthew 11:28 — Come to Him and find rest. How can I help you apply this?",
      ];
      
      setTimeout(() => {
        socket.emit('boonResponse', {
          message: responses[Math.floor(Math.random() * responses.length)],
          verseSuggestion: "Matthew 11:28-30",
          mood: "encouraging"
        });
      }, 1200);
    });

    socket.on('disconnect', () => {
      console.log(`🦁 Bōōns user disconnected: ${socket.id}`);
    });
  });

  console.log('✅ Socket.io initialized for real-time AI Companion & Community');
};
