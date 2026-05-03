import express, { raw } from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { clerkMiddleware } from '@clerk/express';
import './config/backend';

import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { handleClerkWebhook } from './controllers/authController';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import chatRoutes from './routes/chatRoutes';
import messageRoutes from './routes/messageRoutes';
import questRoutes from './routes/questRoutes';

import { initializeSocket } from './utils/socket';

const app = express();
const httpServer = createServer(app);

const FRONTEND_URL = process.env.FRONTEND_URL?.trim();
const ioOrigins = [
  FRONTEND_URL,
  'http://localhost:5173',
  'http://localhost:8081',
  'exp://localhost:8081',
  '*',
].filter(Boolean) as string[];

const io = new Server(httpServer, {
  cors: {
    origin: ioOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Environment
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI (or legacy MONGO_URI) is not defined in backend/.env');
  process.exit(1);
}

// Middleware
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.post('/api/auth/webhook', raw({ type: 'application/json' }), (req, res, next) => {
  void handleClerkWebhook(req, res, next);
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Clerk middleware (must be before routes that need auth)
app.use(clerkMiddleware());

// Health check (public)
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Bornblix Backend is running — Beyond the Verse. Into the Word.',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API Routes (per-route `authenticate` where needed)
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/quests', questRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Initialize Socket.io for real-time features (AI companion, community chat)
initializeSocket(io);

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI as string, {
      retryWrites: true,
    });
    console.log('✅ MongoDB Connected Successfully (Bornblix Cluster)');
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error);
    process.exit(1);
  }
};

// Start Server
const startServer = async () => {
  await connectDB();

  httpServer.listen(PORT, () => {
    console.log(`
🚀 Bornblix Backend Server Started
   Port: http://localhost:${PORT}
   Environment: ${process.env.NODE_ENV || 'development'}
   MongoDB: Connected
   Real-time: Socket.io Active
   Auth: Clerk Integrated
   Mobile Sync Ready (Gamification + AI Chat)
   AI: set OPENAI_API_KEY (optional; mock fallback when unset)
    `);
  });
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    void mongoose.connection.close().then(() => {
      console.log('Process terminated');
      process.exit(0);
    });
  });
});

export { app, io };
export default app;
