// src/models/Message.ts
// Message schema - Chat messages ku structure with encryption

import mongoose, { Schema } from 'mongoose';
import { IMessage } from '../types';

/**
 * Message Schema
 * Messages encrypted form la store aagum
 */
const MessageSchema = new Schema<IMessage>(
  {
    fromUserId: {
      type: Schema.Types.ObjectId, // ObjectId type properly use panrom
      required: [true, 'Sender ID is required'],
      ref: 'User', // User collection ku reference
    },
    toUserId: {
      type: Schema.Types.ObjectId, // ObjectId type properly use panrom
      required: [true, 'Receiver ID is required'],
      ref: 'User',
    },
    contentEncrypted: {
      type: String,
      required: [true, 'Message content is required'],
    },
    contentType: {
      type: String,
      enum: ['text', 'file', 'image'],
      default: 'text',
    },
    fileName: {
      type: String,
      default: null,
    },
    fileSize: {
      type: Number,
      default: null,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes - Query performance improve kaaga
 */
MessageSchema.index({ fromUserId: 1, toUserId: 1 }); // User wise messages fast fetch aagum
MessageSchema.index({ createdAt: -1 }); // Latest messages first
MessageSchema.index({ isRead: 1, toUserId: 1 }); // Unread messages count

// Model export
export default mongoose.model<IMessage>('Message', MessageSchema);