/* eslint-disable @typescript-eslint/no-explicit-any */
// src/types/index.ts
// Frontend types - Backend types ku match aaganum

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
  avatar?: string;
  isOnline?: boolean;
  lastSeen?: Date | string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: User;
    token: string;
  };
}

export interface Message {
  _id: string;
  fromUserId: string;
  toUserId: string;
  content: string;
  contentType: 'text' | 'file' | 'image';
  fileName?: string;
  fileSize?: number;
  isRead: boolean;
  createdAt: Date | string;
  updatedAt?: Date | string;
}

export interface Chat {
  userId: string;
  name: string;
  email: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen: Date | string;
  lastMessage: {
    _id: string;
    content: string;
    contentType: string;
    fromUserId: string;
    createdAt: Date | string;
    isRead: boolean;
  };
  unreadCount: number;
}

export interface Payment {
  _id: string;
  amount: number;
  paymentMethod: 'card' | 'upi' | 'netbanking';
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  cardNumber?: string;
  phone?: string;
  createdAt: Date | string;
  user?: User;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface SendMessageData {
  toUserId: string;
  content: string;
  contentType?: 'text' | 'file' | 'image';
  fileName?: string;
  fileSize?: number;
}

export interface CreatePaymentData {
  amount: number;
  paymentMethod: 'card' | 'upi' | 'netbanking';
  cardNumber?: string;
  phone?: string;
  upiId?: string;
}