// src/routes/messageRoutes.ts
// Message related routes

import express from 'express';
import {
  sendMessage,
  getConversation,
  markMessagesAsRead,
  getUnreadCount,
  getRecentChats,
  deleteMessage,
  searchMessages,
} from '../controllers/messageController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * All message routes are protected
 * authenticate middleware ellam routes ku apply aagum
 */
router.use(authenticate);

// Send message - POST /api/messages/send
router.post('/send', sendMessage);

// Get conversation between two users - GET /api/messages/conversation/:userId
router.get('/conversation/:userId', getConversation);

// Mark messages as read - PUT /api/messages/mark-read/:userId
router.put('/mark-read/:userId', markMessagesAsRead);

// Get unread message count - GET /api/messages/unread-count
router.get('/unread-count', getUnreadCount);

// Get recent chats with last message - GET /api/messages/recent-chats
router.get('/recent-chats', getRecentChats);

// Search messages - GET /api/messages/search
router.get('/search', searchMessages);

// Delete message - DELETE /api/messages/:messageId
router.delete('/:messageId', deleteMessage);

export default router;