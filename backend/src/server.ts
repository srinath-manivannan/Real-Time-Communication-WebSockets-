// src/server.ts
// Main server file - Application entry point

import express, { Application } from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDatabase, closeDatabase } from './config/database';
import { initializeSocket } from './config/socket';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

// Routes import
import authRoutes from './routes/authRoutes';
import messageRoutes from './routes/messageRoutes';
import paymentRoutes from './routes/paymentRoutes';

// Environment variables load panrom
dotenv.config();

/**
 * Express app create panrom
 */
const app: Application = express();
const PORT = process.env.PORT || 5000;

/**
 * HTTP server create panrom (Socket.io kaaga venum)
 */
const httpServer = http.createServer(app);

/**
 * Middleware Setup
 */

// CORS enable panrom - Frontend ku access allow panradhu kaaga
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// JSON body parser
app.use(express.json({ limit: '10mb' }));

// URL encoded data parse panrom
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging (development mode la)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📍 ${req.method} ${req.path}`);
    next();
  });
}

/**
 * Health Check Route
 * Server running ah check panradhu kaaga
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
  });
});

/**
 * API Routes
 * All routes /api prefix with start aagum
 */
app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/payments', paymentRoutes);

/**
 * Root Route
 */
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Welcome to Secure Chat API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      messages: '/api/messages',
      payments: '/api/payments',
      health: '/health',
    },
  });
});

/**
 * 404 Handler - Route not found
 */
app.use(notFoundHandler);

/**
 * Global Error Handler
 */
app.use(errorHandler);

/**
 * Database Connection and Server Start
 */
const startServer = async () => {
  try {
    // MongoDB connect panrom
    await connectDatabase();
    
    // Socket.io initialize panrom
    initializeSocket(httpServer);
    
    // Server start panrom
    httpServer.listen(PORT, () => {
      console.log('🚀 ========================================');
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🚀 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🚀 API URL: http://localhost:${PORT}`);
      console.log(`🚀 Health Check: http://localhost:${PORT}/health`);
      console.log('🚀 ========================================');
    });
    
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

/**
 * Graceful Shutdown
 * Process terminate aagumbodhu clean up panrom
 */
const gracefulShutdown = async (signal: string) => {
  console.log(`\n⚠️  ${signal} received. Starting graceful shutdown...`);
  
  // HTTP server close panrom
  httpServer.close(async () => {
    console.log('🔒 HTTP server closed');
    
    // Database connection close panrom
    await closeDatabase();
    
    console.log('👋 Graceful shutdown completed');
    process.exit(0);
  });
  
  // Timeout - 10 seconds ku aprm force exit
  setTimeout(() => {
    console.error('⚠️  Forced shutdown after timeout');
    process.exit(1);
  }, 10000);
};

/**
 * Process signal handlers
 */
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

/**
 * Unhandled rejection handler
 */
process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled Rejection at:', promise, 'reason:', reason);
  gracefulShutdown('UNHANDLED_REJECTION');
});

/**
 * Uncaught exception handler
 */
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

// Server start panrom
startServer();