/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/chat/ChatList.tsx
// Chat list sidebar - All conversations display

import React, { useState } from 'react';
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  Typography,
  TextField,
  InputAdornment,
  Badge,
  Paper,
  Divider,
} from '@mui/material';
import { SearchOutlined } from '@mui/icons-material';
import Avatar from '@/components/common/Avatar';
import EmptyState from '@/components/common/EmptyState';
import { Chat } from '@/types';
import { formatMessageTime, truncateText } from '@/utils/helpers';

interface ChatListProps {
  chats: Chat[];
  activeUserId: string | null;
  onSelectChat: (chat: Chat) => void;
  loading?: boolean;
}

/**
 * Chat List Component
 * Shows all recent conversations
 */
const ChatList: React.FC<ChatListProps> = ({
  chats,
  activeUserId,
  onSelectChat,
  loading = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  
  /**
   * Filter chats based on search query
   */
  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  return (
    <Paper
      elevation={0}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRight: 1,
        borderColor: 'divider',
      }}
    >
      {/* Search Bar */}
      <Box sx={{ p: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search conversations..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchOutlined fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 3,
            },
          }}
        />
      </Box>
      
      <Divider />
      
      {/* Chat List */}
      <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
        {filteredChats.length === 0 ? (
          <EmptyState
            title={searchQuery ? 'No chats found' : 'No conversations yet'}
            description={
              searchQuery
                ? 'Try searching with a different name'
                : 'Start a new conversation to begin chatting'
            }
          />
        ) : (
          <List sx={{ p: 0 }}>
            {filteredChats.map((chat) => {
              const isActive = chat.userId === activeUserId;
              const isUnread = chat.unreadCount > 0;
              
              return (
                <React.Fragment key={chat.userId}>
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => onSelectChat(chat)}
                      sx={{
                        py: 2,
                        px: 2,
                        bgcolor: isActive ? 'action.selected' : 'transparent',
                        borderLeft: 3,
                        borderColor: isActive ? 'primary.main' : 'transparent',
                        '&:hover': {
                          bgcolor: isActive ? 'action.selected' : 'action.hover',
                        },
                      }}
                    >
                      {/* Avatar */}
                      <ListItemAvatar>
                        <Avatar
                          name={chat.name}
                          src={chat.avatar}
                          isOnline={chat.isOnline}
                          showOnlineIndicator
                          sx={{ width: 48, height: 48 }}
                        />
                      </ListItemAvatar>
                      
                      {/* Chat Info */}
                      <ListItemText
                        primary={
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              mb: 0.5,
                            }}
                          >
                            <Typography
                              variant="subtitle2"
                              fontWeight={isUnread ? 700 : 600}
                              sx={{ flexGrow: 1 }}
                            >
                              {chat.name}
                            </Typography>
                            
                            <Typography
                              variant="caption"
                              color="text.secondary"
                              sx={{ ml: 1 }}
                            >
                              {formatMessageTime(chat.lastMessage.createdAt)}
                            </Typography>
                          </Box>
                        }
                        secondary={
                          <Box
                            sx={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                            }}
                          >
                            <Typography
                              variant="body2"
                              color={isUnread ? 'text.primary' : 'text.secondary'}
                              fontWeight={isUnread ? 600 : 400}
                              sx={{ flexGrow: 1 }}
                            >
                              {truncateText(chat.lastMessage.content, 35)}
                            </Typography>
                            
                            {isUnread && (
                              <Badge
                                badgeContent={chat.unreadCount}
                                color="primary"
                                sx={{ ml: 1 }}
                              />
                            )}
                          </Box>
                        }
                      />
                    </ListItemButton>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              );
            })}
          </List>
        )}
      </Box>
    </Paper>
  );
};

export default ChatList;