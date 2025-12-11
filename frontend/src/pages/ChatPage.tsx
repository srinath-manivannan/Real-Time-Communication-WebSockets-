/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/ChatPage.tsx
// Main chat page - COMPLETE WORKING VERSION

import React, { useEffect, useState } from 'react';
import {
  Box,
  Grid,
  useMediaQuery,
  useTheme,
  Dialog,
  DialogTitle,
  DialogContent,
  List,
  ListItem,
  ListItemButton,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Typography,
  TextField,
  InputAdornment,
} from '@mui/material';
import { Add, SearchOutlined, Close } from '@mui/icons-material';
import ChatList from '@/components/chat/ChatList';
import ChatWindow from '@/components/chat/ChatWindow';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { getRecentChats, getConversation, markMessagesAsRead } from '@/services/messageService';
import { getAllUsers } from '@/services/authService';
import {
  initializeSocket,
  sendMessage as sendSocketMessage,
  onReceiveMessage,
  onMessageSent,
  onUserTyping,
  onUserOnline,
  onUserOffline,
  onMessagesRead,
  getOnlineUsers,
  onOnlineUsersList,
  emitTyping,
  emitStopTyping,
  markAsRead,
  removeAllListeners,
} from '@/services/socket';
import type { Chat, Message, User } from '@/types';
import toast from 'react-hot-toast';

const ChatPage: React.FC = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  const { user, token } = useAuthStore();
  const {
    chats,
    messages,
    activeChat,
    isTyping,
    setChats,
    setMessages,
    addMessage,
    setActiveChat,
    updateUserOnlineStatus,
    markMessagesAsRead: markAsReadStore,
    setTyping,
    updateLastMessage,
    clearMessages,
  } = useChatStore();
  
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [showChatList, setShowChatList] = useState(true);
  
  const [openNewChat, setOpenNewChat] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingUsers, setLoadingUsers] = useState(false);
  
  useEffect(() => {
    if (token) {
      initializeSocket(token);
      loadChats();
      setupSocketListeners();
      getOnlineUsers();
    }
    
    return () => {
      removeAllListeners();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);
  
  const loadChats = async () => {
    setLoading(true);
    try {
      const response = await getRecentChats();
      setChats(response.data || []);
    } catch (error) {
      console.error('Error loading chats:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadAllUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await getAllUsers();
      const currentUserId = user?.id || user?._id;
      const otherUsers = (response.data || []).filter(
        u => (u.id || u._id) !== currentUserId
      );
      setAllUsers(otherUsers);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoadingUsers(false);
    }
  };
  
  const handleOpenNewChat = async () => {
    setOpenNewChat(true);
    await loadAllUsers();
  };
  
  const handleStartNewChat = (selectedUser: User) => {
    const userId = selectedUser._id || selectedUser.id;
    
    if (!userId) {
      toast.error('Invalid user selection');
      return;
    }
    
    const userForChat: User = {
      id: userId,
      _id: userId,
      name: selectedUser.name,
      email: selectedUser.email,
      role: selectedUser.role,
      avatar: selectedUser.avatar,
      isOnline: selectedUser.isOnline,
      lastSeen: selectedUser.lastSeen,
    };
    
    setActiveChat(userForChat);
    clearMessages();
    setOpenNewChat(false);
    
    if (isMobile) {
      setShowChatList(false);
    }
    
    loadConversation(userId);
  };
  
  const loadConversation = async (userId: string) => {
    if (!userId || userId === 'undefined') {
      return;
    }
    
    setMessagesLoading(true);
    try {
      const response = await getConversation(userId);
      setMessages(response.data.messages || []);
    } catch (error: any) {
      if (error.response?.status === 400 || error.response?.status === 404) {
        setMessages([]);
      }
    } finally {
      setMessagesLoading(false);
    }
  };
  
  const setupSocketListeners = () => {
    onReceiveMessage((message: Message) => {
      if (activeChat && (message.fromUserId === activeChat.id || message.fromUserId === activeChat._id)) {
        addMessage(message);
        markAsRead([message._id], message.fromUserId);
      }
      updateLastMessage(message.fromUserId, message);
      loadChats();
    });
    
    onMessageSent((message: Message) => {
      addMessage(message);
      updateLastMessage(message.toUserId, message);
    });
    
    onUserTyping((data: { userId: string; isTyping: boolean }) => {
      if (activeChat && (data.userId === activeChat.id || data.userId === activeChat._id)) {
        setTyping(data.userId, data.isTyping);
      }
    });
    
    onUserOnline((data: { userId: string }) => {
      updateUserOnlineStatus(data.userId, true);
    });
    
    onUserOffline((data: { userId: string }) => {
      updateUserOnlineStatus(data.userId, false);
    });
    
    onOnlineUsersList((users: string[]) => {
      users.forEach((userId) => {
        updateUserOnlineStatus(userId, true);
      });
    });
  };
  
  const handleSelectChat = async (chat: Chat) => {
    const chatUser: User = {
      id: chat.userId,
      _id: chat.userId,
      name: chat.name,
      email: chat.email,
      role: 'user',
      avatar: chat.avatar,
      isOnline: chat.isOnline,
      lastSeen: chat.lastSeen,
    };
    
    setActiveChat(chatUser);
    clearMessages();
    setMessagesLoading(true);
    
    if (isMobile) {
      setShowChatList(false);
    }
    
    try {
      const response = await getConversation(chat.userId);
      setMessages(response.data.messages || []);
      
      if (chat.unreadCount > 0) {
        await markMessagesAsRead(chat.userId);
        markAsReadStore(chat.userId);
      }
    } catch (error) {
      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  };
  
  const handleSendMessage = (content: string) => {
    if (!activeChat) return;
    
    const toUserId = activeChat._id || activeChat.id;
    if (!toUserId) return;
    
    sendSocketMessage({
      toUserId,
      content,
      contentType: 'text',
    });
  };
  
  const handleTyping = () => {
    if (!activeChat) return;
    const toUserId = activeChat._id || activeChat.id;
    if (toUserId) emitTyping(toUserId);
  };
  
  const handleStopTyping = () => {
    if (!activeChat) return;
    const toUserId = activeChat._id || activeChat.id;
    if (toUserId) emitStopTyping(toUserId);
  };
  
  const handleDeleteMessage = async (messageId: string) => {
    setMessages(messages.filter((msg) => msg._id !== messageId));
    toast.success('Message deleted');
  };
  
  const filteredUsers = allUsers.filter((u) =>
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  if (loading) {
    return <LoadingSpinner message="Loading conversations..." />;
  }
  
  return (
    <Box sx={{ height: 'calc(100vh - 64px)', p: 0 }}>
      <Grid container sx={{ height: '100%' }}>
        {(!isMobile || showChatList) && (
          <Grid item xs={12} md={4} lg={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Button
                variant="contained"
                fullWidth
                startIcon={<Add />}
                onClick={handleOpenNewChat}
                sx={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}
              >
                New Chat
              </Button>
            </Box>
            <ChatList
              chats={chats}
              activeUserId={activeChat?.id || activeChat?._id || null}
              onSelectChat={handleSelectChat}
              loading={loading}
            />
          </Grid>
        )}
        
        {(!isMobile || !showChatList) && (
          <Grid item xs={12} md={8} lg={9} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
         

<ChatWindow
  activeUser={activeChat}
  messages={messages}
  currentUserId={user?.id || user?._id || ''}
  isTyping={activeChat ? (isTyping[activeChat.id] || isTyping[activeChat._id || ''] || false) : false}
  loading={messagesLoading}
  onSendMessage={handleSendMessage}
  onTyping={handleTyping}
  onStopTyping={handleStopTyping}
  onDeleteMessage={handleDeleteMessage}
  onBack={isMobile ? () => setShowChatList(true) : undefined} // Add this line
/>
          </Grid>
        )}
      </Grid>
      
      <Dialog open={openNewChat} onClose={() => setOpenNewChat(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" fontWeight={600}>Start New Conversation</Typography>
            <IconButton onClick={() => setOpenNewChat(false)}><Close /></IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchOutlined />
                </InputAdornment>
              ),
            }}
          />
          {loadingUsers ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <LoadingSpinner message="Loading users..." fullScreen={false} />
            </Box>
          ) : filteredUsers.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">
                {searchQuery ? 'No users found' : 'No other users available'}
              </Typography>
            </Box>
          ) : (
            <List>
              {filteredUsers.map((u) => (
                <ListItem key={u.id || u._id} disablePadding>
                  <ListItemButton onClick={() => handleStartNewChat(u)}>
                    <ListItemAvatar>
                      <Avatar name={u.name} src={u.avatar} isOnline={u.isOnline} showOnlineIndicator />
                    </ListItemAvatar>
                    <ListItemText primary={u.name} secondary={u.email} />
                  </ListItemButton>
                </ListItem>
              ))}
            </List>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default ChatPage;