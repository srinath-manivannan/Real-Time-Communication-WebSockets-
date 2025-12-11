// src/config/socket.ts
// WebSocket setup with Socket.io - Real-time chat kaaga

import { Server as HTTPServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { IJWTPayload, ISocketUser } from '../types';
import { encrypt, decrypt } from '../utils/encryption';
import Message from '../models/Message';
import User from '../models/User';

// Online users track panna map
const onlineUsers = new Map<string, string>(); // userId -> socketId

/**
 * Socket.io server initialize and configure panrom
 */
export const initializeSocket = (httpServer: HTTPServer): Server => {
  // Socket.io server create panrom with CORS
  const io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:3000',
      credentials: true,
      methods: ['GET', 'POST'],
    },
  });
  
  /**
   * Socket authentication middleware
   * Connection ku munnadhi JWT token verify panrom
   */
  io.use((socket: Socket, next) => {
    try {
      // Token extract panrom (query or handshake auth la)
      const token = 
        socket.handshake.auth.token || 
        socket.handshake.query.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token missing'));
      }
      
      // JWT verify panrom
      const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
      const decoded = jwt.verify(token as string, jwtSecret) as IJWTPayload;
      
      // Socket object la user data attach panrom
      (socket as any).user = decoded;
      
      next();
    } catch (error) {
      next(new Error('Authentication error: Invalid token'));
    }
  });
  
  /**
   * Connection event - User connect aagumbodhu
   */
  io.on('connection', async (socket: Socket) => {
    const user = (socket as any).user as IJWTPayload;
    const userId = user.userId;
    
    console.log(`✅ User connected: ${user.email} (${socket.id})`);
    
    // Online users map la add panrom
    onlineUsers.set(userId, socket.id);
    
    // User online status update panrom DB la
    await User.findByIdAndUpdate(userId, {
      isOnline: true,
      lastSeen: new Date(),
    });
    
    // User join pannadhu other users ku broadcast panrom
    socket.broadcast.emit('user_online', {
      userId,
      socketId: socket.id,
    });
    
    /**
     * User room ku join aagardhu (private chat kaaga)
     * User ID ye room ID ah use panrom
     */
    socket.join(userId);
    
    /**
     * Send Message Event
     * Client la irrundhu message receive pannumbodhu
     */
    socket.on('send_message', async (data) => {
      try {
        const { toUserId, content, contentType, fileName, fileSize } = data;
        
        console.log(`📨 Message from ${userId} to ${toUserId}`);
        
        // Validation
        if (!toUserId || !content) {
          socket.emit('error', { message: 'Invalid message data' });
          return;
        }
        
        // Content encrypt panni DB la save panrom
        const encryptedContent = encrypt(content);
        
        const message = await Message.create({
          fromUserId: userId,
          toUserId,
          contentEncrypted: encryptedContent,
          contentType: contentType || 'text',
          fileName: fileName || null,
          fileSize: fileSize || null,
          isRead: false,
        });
        
        // Message object prepare panrom (decrypted content with)
        const messageData = {
          _id: message._id,
          fromUserId: message.fromUserId,
          toUserId: message.toUserId,
          content, // Decrypted content
          contentType: message.contentType,
          fileName: message.fileName,
          fileSize: message.fileSize,
          isRead: message.isRead,
          createdAt: message.createdAt,
        };
        
        // Receiver ku message send panrom (if online)
        const receiverSocketId = onlineUsers.get(toUserId);
        if (receiverSocketId) {
          io.to(receiverSocketId).emit('receive_message', messageData);
        }
        
        // Sender ku confirmation send panrom
        socket.emit('message_sent', messageData);
        
      } catch (error: any) {
        console.error('❌ Send message error:', error);
        socket.emit('error', { 
          message: 'Failed to send message',
          error: error.message 
        });
      }
    });
    
    /**
     * Typing Event
     * User type panradhaa indicate panradhu kaaga
     */
    socket.on('typing', (data) => {
      const { toUserId } = data;
      const receiverSocketId = onlineUsers.get(toUserId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', {
          userId,
          isTyping: true,
        });
      }
    });
    
    /**
     * Stop Typing Event
     */
    socket.on('stop_typing', (data) => {
      const { toUserId } = data;
      const receiverSocketId = onlineUsers.get(toUserId);
      
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('user_typing', {
          userId,
          isTyping: false,
        });
      }
    });
    
    /**
     * Mark as Read Event
     * User message read pannumbodhu
     */
    socket.on('mark_as_read', async (data) => {
      try {
        const { messageIds, fromUserId } = data;
        
        // Messages read status update panrom
        await Message.updateMany(
          {
            _id: { $in: messageIds },
            toUserId: userId,
          },
          {
            isRead: true,
          }
        );
        
        // Sender ku notify panrom
        const senderSocketId = onlineUsers.get(fromUserId);
        if (senderSocketId) {
          io.to(senderSocketId).emit('messages_read', {
            messageIds,
            readBy: userId,
          });
        }
        
      } catch (error) {
        console.error('❌ Mark as read error:', error);
      }
    });
    
    /**
     * Get Online Users Event
     * Online users list request
     */
    socket.on('get_online_users', () => {
      const onlineUsersList = Array.from(onlineUsers.keys());
      socket.emit('online_users_list', onlineUsersList);
    });
    
    /**
     * Disconnect Event
     * User disconnect aagumbodhu
     */
    socket.on('disconnect', async () => {
      console.log(`❌ User disconnected: ${user.email} (${socket.id})`);
      
      // Online users la irrundhu remove panrom
      onlineUsers.delete(userId);
      
      // DB la offline status update panrom
      await User.findByIdAndUpdate(userId, {
        isOnline: false,
        lastSeen: new Date(),
      });
      
      // Other users ku broadcast panrom
      socket.broadcast.emit('user_offline', {
        userId,
      });
    });
    
    /**
     * Error handling
     */
    socket.on('error', (error) => {
      console.error('❌ Socket error:', error);
    });
  });
  
  console.log('✅ Socket.io initialized successfully');
  
  return io;
};

/**
 * Get online users list
 */
export const getOnlineUsers = (): string[] => {
  return Array.from(onlineUsers.keys());
};

/**
 * Check if user is online
 */
export const isUserOnline = (userId: string): boolean => {
  return onlineUsers.has(userId);
};