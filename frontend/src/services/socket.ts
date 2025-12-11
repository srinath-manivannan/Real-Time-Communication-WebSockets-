// src/services/socket.ts
// Socket.io client setup - Real-time communication kaaga

import { io, Socket } from 'socket.io-client';
import { Message } from '@/types';
import toast from 'react-hot-toast';

// Socket instance
let socket: Socket | null = null;

// Backend socket URL
const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

/**
 * Socket connection initialize panrom
 */
export const initializeSocket = (token: string): Socket => {
  if (socket?.connected) {
    return socket;
  }
  
  // Socket connection create panrom with auth token
  socket = io(SOCKET_URL, {
    auth: {
      token,
    },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  
  // Connection events
  socket.on('connect', () => {
    console.log('✅ Socket connected:', socket?.id);
  });
  
  socket.on('disconnect', (reason) => {
    console.log('❌ Socket disconnected:', reason);
  });
  
  socket.on('connect_error', (error) => {
    console.error('❌ Socket connection error:', error);
    toast.error('Connection error. Please check your network.');
  });
  
  socket.on('error', (error) => {
    console.error('❌ Socket error:', error);
    toast.error(error.message || 'Something went wrong');
  });
  
  return socket;
};

/**
 * Get socket instance
 */
export const getSocket = (): Socket | null => {
  return socket;
};

/**
 * Disconnect socket
 */
export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

/**
 * Send message via socket
 */
export const sendMessage = (data: {
  toUserId: string;
  content: string;
  contentType?: string;
  fileName?: string;
  fileSize?: number;
}): void => {
  if (!socket?.connected) {
    toast.error('Not connected. Please refresh the page.');
    return;
  }
  
  socket.emit('send_message', data);
};

/**
 * Listen for new messages
 */
export const onReceiveMessage = (callback: (message: Message) => void): void => {
  if (!socket) return;
  
  socket.on('receive_message', callback);
};

/**
 * Listen for message sent confirmation
 */
export const onMessageSent = (callback: (message: Message) => void): void => {
  if (!socket) return;
  
  socket.on('message_sent', callback);
};

/**
 * Emit typing event
 */
export const emitTyping = (toUserId: string): void => {
  if (!socket?.connected) return;
  
  socket.emit('typing', { toUserId });
};

/**
 * Emit stop typing event
 */
export const emitStopTyping = (toUserId: string): void => {
  if (!socket?.connected) return;
  
  socket.emit('stop_typing', { toUserId });
};

/**
 * Listen for typing indicator
 */
export const onUserTyping = (
  callback: (data: { userId: string; isTyping: boolean }) => void
): void => {
  if (!socket) return;
  
  socket.on('user_typing', callback);
};

/**
 * Mark messages as read
 */
export const markAsRead = (messageIds: string[], fromUserId: string): void => {
  if (!socket?.connected) return;
  
  socket.emit('mark_as_read', { messageIds, fromUserId });
};

/**
 * Listen for messages read event
 */
export const onMessagesRead = (
  callback: (data: { messageIds: string[]; readBy: string }) => void
): void => {
  if (!socket) return;
  
  socket.on('messages_read', callback);
};

/**
 * Listen for user online status
 */
export const onUserOnline = (
  callback: (data: { userId: string; socketId: string }) => void
): void => {
  if (!socket) return;
  
  socket.on('user_online', callback);
};

/**
 * Listen for user offline status
 */
export const onUserOffline = (callback: (data: { userId: string }) => void): void => {
  if (!socket) return;
  
  socket.on('user_offline', callback);
};

/**
 * Get online users list
 */
export const getOnlineUsers = (): void => {
  if (!socket?.connected) return;
  
  socket.emit('get_online_users');
};

/**
 * Listen for online users list
 */
export const onOnlineUsersList = (callback: (users: string[]) => void): void => {
  if (!socket) return;
  
  socket.on('online_users_list', callback);
};

/**
 * Remove all socket listeners
 */
export const removeAllListeners = (): void => {
  if (!socket) return;
  
  socket.off('receive_message');
  socket.off('message_sent');
  socket.off('user_typing');
  socket.off('messages_read');
  socket.off('user_online');
  socket.off('user_offline');
  socket.off('online_users_list');
};