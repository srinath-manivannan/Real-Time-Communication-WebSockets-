// src/controllers/messageController.ts
// Message related controllers - Send, Fetch, Mark as Read

import { Response } from 'express';
import mongoose from 'mongoose';
import Message from '../models/Message';
import User from '../models/User';
import { IAuthRequest } from '../types';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { encrypt, decrypt } from '../utils/encryption';
import { isValidObjectId, sanitizeString } from '../utils/validation';

/**
 * Send Message (Store encrypted message in DB)
 * POST /api/messages/send
 */
export const sendMessage = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const fromUserId = req.user?.userId;
    const { toUserId, content, contentType, fileName, fileSize } = req.body;
    
    // Input validation
    if (!toUserId || !content) {
      throw new AppError('Receiver ID and content are required', 400);
    }
    
    // Valid ObjectId ah check panrom
    if (!isValidObjectId(toUserId)) {
      throw new AppError('Invalid receiver ID', 400);
    }
    
    // Receiver exist panranga check panrom
    const receiver = await User.findById(toUserId);
    if (!receiver) {
      throw new AppError('Receiver not found', 404);
    }
    
    // Content sanitize and encrypt panrom
    const sanitizedContent = sanitizeString(content);
    const encryptedContent = encrypt(sanitizedContent);
    
    // Message create panrom
    const message = await Message.create({
      fromUserId: new mongoose.Types.ObjectId(fromUserId), // String a ObjectId ku convert panrom
      toUserId: new mongoose.Types.ObjectId(toUserId),
      contentEncrypted: encryptedContent,
      contentType: contentType || 'text',
      fileName: fileName || null,
      fileSize: fileSize || null,
      isRead: false,
    });
    
    // Response send panrom (decrypted content dhaan send panrom)
    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: {
        _id: message._id.toString(),
        fromUserId: message.fromUserId.toString(),
        toUserId: message.toUserId.toString(),
        content: sanitizedContent, // Decrypted content
        contentType: message.contentType,
        fileName: message.fileName,
        fileSize: message.fileSize,
        isRead: message.isRead,
        createdAt: message.createdAt,
      },
    });
  }
);

/**
 * Get Conversation between two users
 * GET /api/messages/conversation/:userId
 */
export const getConversation = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const currentUserId = req.user?.userId;
    const { userId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    
    // Valid ObjectId ah check panrom
    if (!isValidObjectId(userId)) {
      throw new AppError('Invalid user ID', 400);
    }
    
    // Pagination calculate panrom
    const skip = (Number(page) - 1) * Number(limit);
    
    // ObjectId ku convert panrom
    const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);
    const otherUserObjectId = new mongoose.Types.ObjectId(userId);
    
    // Two users kulla nadakkira ella messages um edukrom
    const messages = await Message.find({
      $or: [
        { fromUserId: currentUserObjectId, toUserId: otherUserObjectId },
        { fromUserId: otherUserObjectId, toUserId: currentUserObjectId },
      ],
    })
      .sort({ createdAt: -1 }) // Latest messages first
      .skip(skip)
      .limit(Number(limit))
      .lean(); // Plain JS object ah return panrom (performance kaaga)
    
    // Total count edukrom (pagination kaaga)
    const totalMessages = await Message.countDocuments({
      $or: [
        { fromUserId: currentUserObjectId, toUserId: otherUserObjectId },
        { fromUserId: otherUserObjectId, toUserId: currentUserObjectId },
      ],
    });
    
    // Messages decrypt panni send panrom
    const decryptedMessages = messages.map((msg) => ({
      _id: msg._id.toString(),
      fromUserId: msg.fromUserId.toString(),
      toUserId: msg.toUserId.toString(),
      content: decrypt(msg.contentEncrypted), // Decrypt panrom
      contentType: msg.contentType,
      fileName: msg.fileName,
      fileSize: msg.fileSize,
      isRead: msg.isRead,
      createdAt: msg.createdAt,
      updatedAt: msg.updatedAt,
    }));
    
    res.status(200).json({
      success: true,
      data: {
        messages: decryptedMessages.reverse(), // Oldest first kaaga reverse panrom
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalMessages / Number(limit)),
          totalMessages,
          limit: Number(limit),
        },
      },
    });
  }
);

/**
 * Mark messages as read
 * PUT /api/messages/mark-read/:userId
 */
export const markMessagesAsRead = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const currentUserId = req.user?.userId;
    const { userId } = req.params;
    
    // Valid ObjectId check
    if (!isValidObjectId(userId)) {
      throw new AppError('Invalid user ID', 400);
    }
    
    // ObjectId ku convert panrom
    const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);
    const otherUserObjectId = new mongoose.Types.ObjectId(userId);
    
    // Specific user la irrundhu vara unread messages ellam read panrom
    const result = await Message.updateMany(
      {
        fromUserId: otherUserObjectId,
        toUserId: currentUserObjectId,
        isRead: false,
      },
      {
        isRead: true,
      }
    );
    
    res.status(200).json({
      success: true,
      message: 'Messages marked as read',
      data: {
        modifiedCount: result.modifiedCount,
      },
    });
  }
);

/**
 * Get Unread Message Count
 * GET /api/messages/unread-count
 */
export const getUnreadCount = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const currentUserId = req.user?.userId;
    
    // ObjectId ku convert panrom
    const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);
    
    // Unread messages count edukrom
    const unreadCount = await Message.countDocuments({
      toUserId: currentUserObjectId,
      isRead: false,
    });
    
    res.status(200).json({
      success: true,
      data: {
        unreadCount,
      },
    });
  }
);

/**
 * Get Recent Chats (Users list with last message)
 * GET /api/messages/recent-chats
 */
export const getRecentChats = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const currentUserId = req.user?.userId;
    
    // ObjectId ku convert panrom
    const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);
    
    // Aggregation pipeline - User details with last message join panrom
    const recentChats = await Message.aggregate([
      // Current user involve aana messages mattum filter panrom
      {
        $match: {
          $or: [
            { fromUserId: currentUserObjectId },
            { toUserId: currentUserObjectId },
          ],
        },
      },
      // Latest message first sort panrom
      {
        $sort: { createdAt: -1 },
      },
      // Each conversation ku last message mattum edukrom
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ['$fromUserId', currentUserObjectId] },
              '$toUserId',
              '$fromUserId',
            ],
          },
          lastMessage: { $first: '$$ROOT' },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ['$toUserId', currentUserObjectId] },
                    { $eq: ['$isRead', false] },
                  ],
                },
                1,
                0,
              ],
            },
          },
        },
      },
      // User details join panrom
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      // Array la irrundhu first element edukrom
      {
        $unwind: '$userDetails',
      },
      // Required fields mattum select panrom
      {
        $project: {
          userId: '$_id',
          name: '$userDetails.name',
          email: '$userDetails.email',
          avatar: '$userDetails.avatar',
          isOnline: '$userDetails.isOnline',
          lastSeen: '$userDetails.lastSeen',
          lastMessage: {
            _id: '$lastMessage._id',
            content: '$lastMessage.contentEncrypted',
            contentType: '$lastMessage.contentType',
            fromUserId: '$lastMessage.fromUserId',
            createdAt: '$lastMessage.createdAt',
            isRead: '$lastMessage.isRead',
          },
          unreadCount: 1,
        },
      },
      // Latest conversation first
      {
        $sort: { 'lastMessage.createdAt': -1 },
      },
    ]);
    
    // Last message decrypt panrom
    const decryptedChats = recentChats.map((chat) => ({
      userId: chat.userId.toString(),
      name: chat.name,
      email: chat.email,
      avatar: chat.avatar,
      isOnline: chat.isOnline,
      lastSeen: chat.lastSeen,
      lastMessage: {
        _id: chat.lastMessage._id.toString(),
        content: decrypt(chat.lastMessage.content), // Decrypt panrom
        contentType: chat.lastMessage.contentType,
        fromUserId: chat.lastMessage.fromUserId.toString(),
        createdAt: chat.lastMessage.createdAt,
        isRead: chat.lastMessage.isRead,
      },
      unreadCount: chat.unreadCount,
    }));
    
    res.status(200).json({
      success: true,
      data: decryptedChats,
    });
  }
);

/**
 * Delete Message
 * DELETE /api/messages/:messageId
 */
export const deleteMessage = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const currentUserId = req.user?.userId;
    const { messageId } = req.params;
    
    // Valid ObjectId check
    if (!isValidObjectId(messageId)) {
      throw new AppError('Invalid message ID', 400);
    }
    
    // Message find panrom
    const message = await Message.findById(messageId);
    
    if (!message) {
      throw new AppError('Message not found', 404);
    }
    
    // Only sender dhaan delete panna mudiyum (ObjectId string ku convert panni compare panrom)
    if (message.fromUserId.toString() !== currentUserId) {
      throw new AppError('You can only delete your own messages', 403);
    }
    
    // Message delete panrom
    await Message.findByIdAndDelete(messageId);
    
    res.status(200).json({
      success: true,
      message: 'Message deleted successfully',
    });
  }
);

/**
 * Search Messages
 * GET /api/messages/search
 */
export const searchMessages = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const currentUserId = req.user?.userId;
    const { query, userId } = req.query;
    
    if (!query) {
      throw new AppError('Search query is required', 400);
    }
    
    // ObjectId ku convert panrom
    const currentUserObjectId = new mongoose.Types.ObjectId(currentUserId);
    
    // Build search filter
    const searchFilter: any = {
      $or: [
        { fromUserId: currentUserObjectId },
        { toUserId: currentUserObjectId },
      ],
    };
    
    // Specific user la search pannanum na
    if (userId && isValidObjectId(userId as string)) {
      const otherUserObjectId = new mongoose.Types.ObjectId(userId as string);
      searchFilter.$and = [
        {
          $or: [
            { fromUserId: currentUserObjectId, toUserId: otherUserObjectId },
            { fromUserId: otherUserObjectId, toUserId: currentUserObjectId },
          ],
        },
      ];
    }
    
    // All messages fetch panrom
    const messages = await Message.find(searchFilter)
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    
    // Decrypt panni search panrom (client-side la search better but idhu demo kaaga)
    const searchResults = messages
      .map((msg) => ({
        _id: msg._id.toString(),
        fromUserId: msg.fromUserId.toString(),
        toUserId: msg.toUserId.toString(),
        content: decrypt(msg.contentEncrypted),
        contentType: msg.contentType,
        createdAt: msg.createdAt,
        isRead: msg.isRead,
      }))
      .filter((msg) =>
        msg.content.toLowerCase().includes((query as string).toLowerCase())
      );
    
    res.status(200).json({
      success: true,
      data: searchResults,
    });
  }
);