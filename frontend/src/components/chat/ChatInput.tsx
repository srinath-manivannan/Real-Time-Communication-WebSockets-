/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/chat/ChatInput.tsx
// Message input component with typing indicator

import React, { useState, useRef } from 'react';
import { Box, TextField, IconButton, Paper, Typography } from '@mui/material';
import { Send, AttachFile, EmojiEmotions } from '@mui/icons-material';

interface ChatInputProps {
  onSendMessage: (content: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  isTyping?: boolean;
  disabled?: boolean;
}

/**
 * Chat Input Component
 * Input field for sending messages
 */
const ChatInput: React.FC<ChatInputProps> = ({
  onSendMessage,
  onTyping,
  onStopTyping,
  isTyping = false,
  disabled = false,
}) => {
  const [message, setMessage] = useState('');
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  /**
   * Handle input change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setMessage(value);
    
    // Emit typing event
    if (value && !isTyping) {
      onTyping();
    }
    
    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(() => {
      onStopTyping();
    }, 1000);
  };
  
  /**
   * Handle send message
   */
  const handleSend = () => {
    const trimmedMessage = message.trim();
    
    if (!trimmedMessage) return;
    
    onSendMessage(trimmedMessage);
    setMessage('');
    onStopTyping();
    
    // Clear typing timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
  };
  
  /**
   * Handle key press (Enter to send)
   */
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };
  
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'flex-end', gap: 1 }}>
        {/* Attachment Button */}
        <IconButton
          size="small"
          disabled={disabled}
          sx={{ mb: 1 }}
        >
          <AttachFile />
        </IconButton>
        
        {/* Message Input */}
        <TextField
          fullWidth
          multiline
          maxRows={4}
          placeholder="Type a message..."
          value={message}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          disabled={disabled}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
            },
          }}
        />
        
        {/* Emoji Button */}
        <IconButton
          size="small"
          disabled={disabled}
          sx={{ mb: 1 }}
        >
          <EmojiEmotions />
        </IconButton>
        
        {/* Send Button */}
        <IconButton
          color="primary"
          onClick={handleSend}
          disabled={disabled || !message.trim()}
          sx={{
            mb: 1,
            bgcolor: 'primary.main',
            color: 'white',
            '&:hover': {
              bgcolor: 'primary.dark',
            },
            '&.Mui-disabled': {
              bgcolor: 'action.disabledBackground',
            },
          }}
        >
          <Send />
        </IconButton>
      </Box>
    </Paper>
  );
};

export default ChatInput;