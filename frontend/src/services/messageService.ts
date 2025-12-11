/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/messageService.ts
// Message related API calls

import api from './api';
import { Message, Chat, SendMessageData, ApiResponse } from '@/types';

/**
 * Send message (HTTP fallback if socket fails)
 */
export const sendMessage = async (data: SendMessageData): Promise<ApiResponse<Message>> => {
  const response = await api.post<ApiResponse<Message>>('/messages/send', data);
  return response.data;
};

/**
 * Get conversation with a user
 */
export const getConversation = async (
  userId: string,
  page: number = 1,
  limit: number = 50
): Promise<ApiResponse<{ messages: Message[]; pagination: any }>> => {
  const response = await api.get<ApiResponse<{ messages: Message[]; pagination: any }>>(
    `/messages/conversation/${userId}`,
    {
      params: { page, limit },
    }
  );
  return response.data;
};

/**
 * Mark messages as read
 */
export const markMessagesAsRead = async (
  userId: string
): Promise<ApiResponse<{ modifiedCount: number }>> => {
  const response = await api.put<ApiResponse<{ modifiedCount: number }>>(
    `/messages/mark-read/${userId}`
  );
  return response.data;
};

/**
 * Get unread message count
 */
export const getUnreadCount = async (): Promise<ApiResponse<{ unreadCount: number }>> => {
  const response = await api.get<ApiResponse<{ unreadCount: number }>>(
    '/messages/unread-count'
  );
  return response.data;
};

/**
 * Get recent chats
 */
export const getRecentChats = async (): Promise<ApiResponse<Chat[]>> => {
  const response = await api.get<ApiResponse<Chat[]>>('/messages/recent-chats');
  return response.data;
};

/**
 * Delete message
 */
export const deleteMessage = async (messageId: string): Promise<ApiResponse> => {
  const response = await api.delete<ApiResponse>(`/messages/${messageId}`);
  return response.data;
};

/**
 * Search messages
 */
export const searchMessages = async (
  query: string,
  userId?: string
): Promise<ApiResponse<Message[]>> => {
  const response = await api.get<ApiResponse<Message[]>>('/messages/search', {
    params: { query, userId },
  });
  return response.data;
};