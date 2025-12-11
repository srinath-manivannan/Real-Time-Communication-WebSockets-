/* eslint-disable @typescript-eslint/no-explicit-any */
// src/utils/helpers.ts
// Utility helper functions

import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';

/**
 * Format date to readable string
 */
export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return format(d, 'MMM dd, yyyy');
};

/**
 * Format time to readable string
 */
export const formatTime = (date: Date | string): string => {
  const d = new Date(date);
  return format(d, 'hh:mm a');
};

/**
 * Format date and time together
 */
export const formatDateTime = (date: Date | string): string => {
  const d = new Date(date);
  return format(d, 'MMM dd, yyyy hh:mm a');
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date: Date | string): string => {
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

/**
 * Format message time
 * Today: "10:30 AM"
 * Yesterday: "Yesterday"
 * Older: "Jan 15"
 */
export const formatMessageTime = (date: Date | string): string => {
  const d = new Date(date);
  
  if (isToday(d)) {
    return format(d, 'hh:mm a');
  }
  
  if (isYesterday(d)) {
    return 'Yesterday';
  }
  
  return format(d, 'MMM dd');
};

/**
 * Format chat date header
 */
export const formatChatDateHeader = (date: Date | string): string => {
  const d = new Date(date);
  
  if (isToday(d)) {
    return 'Today';
  }
  
  if (isYesterday(d)) {
    return 'Yesterday';
  }
  
  return format(d, 'MMMM dd, yyyy');
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number = 50): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Format currency (Indian Rupees)
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
};

/**
 * Get initials from name
 */
export const getInitials = (name: string): string => {
  const names = name.trim().split(' ');
  if (names.length === 1) {
    return names[0].charAt(0).toUpperCase();
  }
  return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
};

/**
 * Generate random color for avatar
 */
export const getAvatarColor = (name: string): string => {
  const colors = [
    '#f43f5e', '#ec4899', '#d946ef', '#a855f7',
    '#8b5cf6', '#6366f1', '#3b82f6', '#0ea5e9',
    '#06b6d4', '#14b8a6', '#10b981', '#84cc16',
  ];
  
  const index = name.charCodeAt(0) % colors.length;
  return colors[index];
};

/**
 * Validate email format
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return emailRegex.test(email);
};

/**
 * Group messages by date
 */
export const groupMessagesByDate = (messages: any[]): { [key: string]: any[] } => {
  const grouped: { [key: string]: any[] } = {};
  
  messages.forEach((message) => {
    const dateKey = formatChatDateHeader(message.createdAt);
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    
    grouped[dateKey].push(message);
  });
  
  return grouped;
};