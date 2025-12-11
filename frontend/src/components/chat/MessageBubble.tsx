/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/chat/MessageBubble.tsx
// Individual message display component

import React from 'react';
import { Box, Typography, Paper, IconButton, Menu, MenuItem } from '@mui/material';
import { MoreVert, DoneAll, Done } from '@mui/icons-material';
import { Message } from '@/types';
import { formatTime } from '@/utils/helpers';

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
  showAvatar?: boolean;
  onDelete?: (messageId: string) => void;
}

/**
 * Message Bubble Component
 * Display individual chat message
 */
const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isOwn,
  showAvatar = true,
  onDelete,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleDelete = () => {
    if (onDelete) {
      onDelete(message._id);
    }
    handleMenuClose();
  };
  
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: isOwn ? 'flex-end' : 'flex-start',
        mb: 1.5,
        px: 2,
      }}
    >
      <Box
        sx={{
          maxWidth: '70%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: isOwn ? 'flex-end' : 'flex-start',
        }}
      >
        {/* Message Content */}
        <Paper
          elevation={0}
          sx={{
            px: 2,
            py: 1.5,
            bgcolor: isOwn ? 'primary.main' : 'background.paper',
            color: isOwn ? 'primary.contrastText' : 'text.primary',
            borderRadius: 3,
            borderTopRightRadius: isOwn ? 0 : 3,
            borderTopLeftRadius: isOwn ? 3 : 0,
            position: 'relative',
            boxShadow: isOwn ? 2 : 1,
            '&:hover .message-menu': {
              opacity: 1,
            },
          }}
        >
          {/* Message Text */}
          <Typography
            variant="body2"
            sx={{
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
            }}
          >
            {message.content}
          </Typography>
          
          {/* Message Menu (Own messages only) */}
          {isOwn && onDelete && (
            <IconButton
              size="small"
              className="message-menu"
              onClick={handleMenuOpen}
              sx={{
                position: 'absolute',
                top: -8,
                right: -8,
                opacity: 0,
                transition: 'opacity 0.2s',
                bgcolor: 'background.paper',
                boxShadow: 2,
                '&:hover': {
                  bgcolor: 'background.paper',
                },
              }}
            >
              <MoreVert fontSize="small" />
            </IconButton>
          )}
          
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
              Delete
            </MenuItem>
          </Menu>
        </Paper>
        
        {/* Message Time and Status */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 0.5,
            mt: 0.5,
            px: 1,
          }}
        >
          <Typography variant="caption" color="text.secondary">
            {formatTime(message.createdAt)}
          </Typography>
          
          {/* Read Status (Own messages only) */}
          {isOwn && (
            <>
              {message.isRead ? (
                <DoneAll sx={{ fontSize: 14, color: 'primary.main' }} />
              ) : (
                <Done sx={{ fontSize: 14, color: 'text.secondary' }} />
              )}
            </>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default MessageBubble;