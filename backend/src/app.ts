import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { clerkMiddleware } from '@clerk/express';
import './config/backend';

import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { authenticate } from './middleware/auth';

import authRoutes from './routes/authRoutes';
import userRoutes from './routes/userRoutes';
import chatRoutes from './routes/chatRoutes';
import messageRoutes from './routes/messageRoutes';

import { initializeSocket } from './utils/socket';

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:8081', 'exp://localhost:8081', '*'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Environment
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is not defined in .env');
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: true,
  credentials: true,
}));
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
    version: '1.0.0'
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticate, userRoutes);
app.use('/api/chat', authenticate, chatRoutes);
app.use('/api/messages', authenticate, messageRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

// Initialize Socket.io for real-time features (AI companion, group chat)
initializeSocket(io);

// MongoDB Connection
const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI as string, {
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
    `);
  });
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  httpServer.close(() => {
    mongoose.connection.close(false, () => {
      console.log('Process terminated');
      process.exit(0);
    });
  });
});

export { app, io };
export default app;
