// src/store/chatStore.ts
// Zustand store for chat state management

import { create } from 'zustand';
import { Message, Chat, User } from '@/types';

interface ChatState {
  // State
  chats: Chat[];
  messages: Message[];
  activeChat: User | null;
  unreadCount: number;
  onlineUsers: string[];
  isTyping: { [userId: string]: boolean };
  
  // Actions
  setChats: (chats: Chat[]) => void;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setActiveChat: (user: User | null) => void;
  setUnreadCount: (count: number) => void;
  setOnlineUsers: (users: string[]) => void;
  updateUserOnlineStatus: (userId: string, isOnline: boolean) => void;
  markMessagesAsRead: (userId: string) => void;
  setTyping: (userId: string, isTyping: boolean) => void;
  updateLastMessage: (userId: string, message: Message) => void;
  clearMessages: () => void;
}

/**
 * Chat Store
 * Chat related state ellam manage panrom
 */
export const useChatStore = create<ChatState>((set) => ({
  // Initial state
  chats: [],
  messages: [],
  activeChat: null,
  unreadCount: 0,
  onlineUsers: [],
  isTyping: {},
  
  /**
   * Set chats list
   */
  setChats: (chats) => set({ chats }),
  
  /**
   * Set messages for active chat
   */
  setMessages: (messages) => set({ messages }),
  
  /**
   * Add new message to current conversation
   */
  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),
  
  /**
   * Set active chat user
   */
  setActiveChat: (user) => set({ activeChat: user }),
  
  /**
   * Set unread messages count
   */
  setUnreadCount: (count) => set({ unreadCount: count }),
  
  /**
   * Set online users list
   */
  setOnlineUsers: (users) => set({ onlineUsers: users }),
  
  /**
   * Update specific user's online status
   */
  updateUserOnlineStatus: (userId, isOnline) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.userId === userId ? { ...chat, isOnline } : chat
      ),
    })),
  
  /**
   * Mark messages as read
   */
  markMessagesAsRead: (userId) =>
    set((state) => ({
      messages: state.messages.map((msg) =>
        msg.fromUserId === userId ? { ...msg, isRead: true } : msg
      ),
      chats: state.chats.map((chat) =>
        chat.userId === userId ? { ...chat, unreadCount: 0 } : chat
      ),
    })),
  
  /**
   * Set typing indicator
   */
  setTyping: (userId, isTyping) =>
    set((state) => ({
      isTyping: { ...state.isTyping, [userId]: isTyping },
    })),
  
  /**
   * Update last message in chat list
   */
  updateLastMessage: (userId, message) =>
    set((state) => ({
      chats: state.chats.map((chat) =>
        chat.userId === userId
          ? {
              ...chat,
              lastMessage: {
                _id: message._id,
                content: message.content,
                contentType: message.contentType,
                fromUserId: message.fromUserId,
                createdAt: message.createdAt,
                isRead: message.isRead,
              },
            }
          : chat
      ),
    })),
  
  /**
   * Clear all messages (when switching chats)
   */
  clearMessages: () => set({ messages: [] }),
}));