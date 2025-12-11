// /* eslint-disable @typescript-eslint/no-unused-vars */
// // src/components/chat/ChatWindow.tsx
// // Main chat window - Messages display and conversation

// import React, { useEffect, useRef } from 'react';
// import {
//   Box,
//   Paper,
//   Typography,
//   IconButton,
//   Divider,
//   CircularProgress,
// } from '@mui/material';
// import { MoreVert, PhoneOutlined, VideoCallOutlined } from '@mui/icons-material';
// import Avatar from '@/components/common/Avatar';
// import MessageBubble from './MessageBubble';
// import ChatInput from './ChatInput';
// import EmptyState from '@/components/common/EmptyState';
// import { Message, User } from '@/types';
// import { groupMessagesByDate } from '@/utils/helpers';

// interface ChatWindowProps {
//   activeUser: User | null;
//   messages: Message[];
//   currentUserId: string;
//   isTyping: boolean;
//   loading: boolean;
//   onSendMessage: (content: string) => void;
//   onTyping: () => void;
//   onStopTyping: () => void;
//   onDeleteMessage: (messageId: string) => void;
// }

// /**
//  * Chat Window Component
//  * Main chat conversation area
//  */
// const ChatWindow: React.FC<ChatWindowProps> = ({
//   activeUser,
//   messages,
//   currentUserId,
//   isTyping,
//   loading,
//   onSendMessage,
//   onTyping,
//   onStopTyping,
//   onDeleteMessage,
// }) => {
//   const messagesEndRef = useRef<HTMLDivElement>(null);
//   const messagesContainerRef = useRef<HTMLDivElement>(null);
  
//   /**
//    * Scroll to bottom when new messages arrive
//    */
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   }, [messages]);
  
//   /**
//    * Group messages by date
//    */
//   const groupedMessages = groupMessagesByDate(messages);
  
//   /**
//    * No active chat selected
//    */
//   if (!activeUser) {
//     return (
//       <Paper
//         elevation={0}
//         sx={{
//           height: '100%',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//         }}
//       >
//         <EmptyState
//           title="Select a conversation"
//           description="Choose a conversation from the list to start chatting"
//         />
//       </Paper>
//     );
//   }
  
//   return (
//     <Box
//       sx={{
//         height: '100%',
//         display: 'flex',
//         flexDirection: 'column',
//       }}
//     >
//       {/* Chat Header */}
//       <Paper
//         elevation={0}
//         sx={{
//           p: 2,
//           borderBottom: 1,
//           borderColor: 'divider',
//           display: 'flex',
//           alignItems: 'center',
//           gap: 2,
//         }}
//       >
//         {/* User Avatar and Info */}
//         <Avatar
//           name={activeUser.name}
//           src={activeUser.avatar}
//           isOnline={activeUser.isOnline}
//           showOnlineIndicator
//           sx={{ width: 45, height: 45 }}
//         />
        
//         <Box sx={{ flexGrow: 1 }}>
//           <Typography variant="subtitle1" fontWeight={600}>
//             {activeUser.name}
//           </Typography>
//           <Typography variant="caption" color="text.secondary">
//             {activeUser.isOnline ? 'Online' : 'Offline'}
//           </Typography>
//         </Box>
        
//         {/* Action Buttons */}
//         <IconButton size="small">
//           <PhoneOutlined />
//         </IconButton>
//         <IconButton size="small">
//           <VideoCallOutlined />
//         </IconButton>
//         <IconButton size="small">
//           <MoreVert />
//         </IconButton>
//       </Paper>
      
//       {/* Messages Area */}
//       <Box
//         ref={messagesContainerRef}
//         sx={{
//           flexGrow: 1,
//           overflow: 'auto',
//           bgcolor: 'background.default',
//           py: 2,
//         }}
//       >
//         {loading ? (
//           <Box
//             sx={{
//               display: 'flex',
//               justifyContent: 'center',
//               alignItems: 'center',
//               height: '100%',
//             }}
//           >
//             <CircularProgress />
//           </Box>
//         ) : messages.length === 0 ? (
//           <EmptyState
//             title="No messages yet"
//             description="Start the conversation by sending a message"
//           />
//         ) : (
//           <>
//             {/* Grouped Messages */}
//             {Object.entries(groupedMessages).map(([date, msgs]) => (
//               <Box key={date}>
//                 {/* Date Divider */}
//                 <Box
//                   sx={{
//                     display: 'flex',
//                     justifyContent: 'center',
//                     my: 2,
//                   }}
//                 >
//                   <Typography
//                     variant="caption"
//                     sx={{
//                       bgcolor: 'background.paper',
//                       px: 2,
//                       py: 0.5,
//                       borderRadius: 2,
//                       boxShadow: 1,
//                     }}
//                   >
//                     {date}
//                   </Typography>
//                 </Box>
                
//                 {/* Messages for this date */}
//                 {msgs.map((message) => (
//                   <MessageBubble
//                     key={message._id}
//                     message={message}
//                     isOwn={message.fromUserId === currentUserId}
//                     onDelete={onDeleteMessage}
//                   />
//                 ))}
//               </Box>
//             ))}
            
//             {/* Typing Indicator */}
//             {isTyping && (
//               <Box sx={{ px: 2, py: 1 }}>
//                 <Typography variant="caption" color="text.secondary" fontStyle="italic">
//                   {activeUser.name} is typing...
//                 </Typography>
//               </Box>
//             )}
            
//             {/* Scroll anchor */}
//             <div ref={messagesEndRef} />
//           </>
//         )}
//       </Box>
      
//       {/* Chat Input */}
//       <ChatInput
//         onSendMessage={onSendMessage}
//         onTyping={onTyping}
//         onStopTyping={onStopTyping}
//       />
//     </Box>
//   );
// };

// export default ChatWindow;
// src/components/chat/ChatWindow.tsx
// Updated with better mobile responsive header

import React, { useEffect, useRef } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  CircularProgress,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { 
  MoreVert, 
  PhoneOutlined, 
  VideoCallOutlined,
  ArrowBack,
} from '@mui/icons-material';
import Avatar from '@/components/common/Avatar';
import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';
import EmptyState from '@/components/common/EmptyState';
import { Message, User } from '@/types';
import { groupMessagesByDate } from '@/utils/helpers';

interface ChatWindowProps {
  activeUser: User | null;
  messages: Message[];
  currentUserId: string;
  isTyping: boolean;
  loading: boolean;
  onSendMessage: (content: string) => void;
  onTyping: () => void;
  onStopTyping: () => void;
  onDeleteMessage: (messageId: string) => void;
  onBack?: () => void; // Add back button for mobile
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  activeUser,
  messages,
  currentUserId,
  isTyping,
  loading,
  onSendMessage,
  onTyping,
  onStopTyping,
  onDeleteMessage,
  onBack,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);
  
  const groupedMessages = groupMessagesByDate(messages);
  
  if (!activeUser) {
    return (
      <Paper
        elevation={0}
        sx={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <EmptyState
          title="Select a conversation"
          description="Choose a conversation from the list to start chatting"
        />
      </Paper>
    );
  }
  
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Chat Header - Responsive */}
      <Paper
        elevation={0}
        sx={{
          p: { xs: 1.5, sm: 2 },
          borderBottom: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1, sm: 2 },
        }}
      >
        {/* Back Button - Mobile Only */}
        {isMobile && onBack && (
          <IconButton onClick={onBack} size="small">
            <ArrowBack />
          </IconButton>
        )}
        
        {/* User Avatar and Info */}
        <Avatar
          name={activeUser.name}
          src={activeUser.avatar}
          isOnline={activeUser.isOnline}
          showOnlineIndicator
          sx={{ width: { xs: 40, sm: 45 }, height: { xs: 40, sm: 45 } }}
        />
        
        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
          <Typography 
            variant="subtitle1" 
            fontWeight={600}
            noWrap
            sx={{ fontSize: { xs: '0.95rem', sm: '1rem' } }}
          >
            {activeUser.name}
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
          >
            {activeUser.isOnline ? 'Online' : 'Offline'}
          </Typography>
        </Box>
        
        {/* Action Buttons - Hide some on mobile */}
        {!isMobile && (
          <>
            <IconButton size="small">
              <PhoneOutlined />
            </IconButton>
            <IconButton size="small">
              <VideoCallOutlined />
            </IconButton>
          </>
        )}
        <IconButton size="small">
          <MoreVert />
        </IconButton>
      </Paper>
      
      {/* Messages Area */}
      <Box
        ref={messagesContainerRef}
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          bgcolor: 'background.default',
          py: 2,
        }}
      >
        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
            }}
          >
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <EmptyState
            title="No messages yet"
            description="Start the conversation by sending a message"
          />
        ) : (
          <>
            {Object.entries(groupedMessages).map(([date, msgs]) => (
              <Box key={date}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    my: 2,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      bgcolor: 'background.paper',
                      px: 2,
                      py: 0.5,
                      borderRadius: 2,
                      boxShadow: 1,
                      fontSize: { xs: '0.7rem', sm: '0.75rem' },
                    }}
                  >
                    {date}
                  </Typography>
                </Box>
                
                {msgs.map((message) => (
                  <MessageBubble
                    key={message._id}
                    message={message}
                    isOwn={message.fromUserId === currentUserId}
                    onDelete={onDeleteMessage}
                  />
                ))}
              </Box>
            ))}
            
            {isTyping && (
              <Box sx={{ px: 2, py: 1 }}>
                <Typography 
                  variant="caption" 
                  color="text.secondary" 
                  fontStyle="italic"
                  sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}
                >
                  {activeUser.name} is typing...
                </Typography>
              </Box>
            )}
            
            <div ref={messagesEndRef} />
          </>
        )}
      </Box>
      
      {/* Chat Input */}
      <ChatInput
        onSendMessage={onSendMessage}
        onTyping={onTyping}
        onStopTyping={onStopTyping}
      />
    </Box>
  );
};

export default ChatWindow;