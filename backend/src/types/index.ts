// src/types/index.ts
// All TypeScript types and interfaces

import { Request } from 'express';
import { Document, Types } from 'mongoose';

// ==================== USER TYPES ====================

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// ==================== MESSAGE TYPES ====================

export interface IMessage extends Document {
  _id: Types.ObjectId;
  fromUserId: Types.ObjectId;
  toUserId: Types.ObjectId;
  contentEncrypted: string;
  content: string;
  contentType: 'text' | 'image' | 'file';
  fileName?: string;
  fileSize?: number;
  isRead: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ==================== PAYMENT TYPES ====================

export interface IPayment extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  amount: number;
  paymentMethod: 'card' | 'upi' | 'netbanking';
  cardNumberEncrypted?: string;
  phoneEncrypted?: string;
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

// ==================== AUTH REQUEST ====================

export interface IAuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: 'user' | 'admin';
  };
}

// ==================== JWT TYPES ====================

export interface IJWTPayload {
  userId: string;
  email: string;
  role: 'user' | 'admin';
  iat?: number;
  exp?: number;
}

// ==================== SOCKET TYPES ====================

export interface ISocketUser {
  socketId: string;
  userId: string;
}

export interface ITypingData {
  userId: string;
  isTyping: boolean;
}

export interface ISendMessageData {
  toUserId: string;
  content: string;
  contentType?: 'text' | 'image' | 'file';
  fileName?: string;
  fileSize?: number;
}

export interface IMarkAsReadData {
  messageIds: string[];
  fromUserId: string;
}