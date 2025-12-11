// src/components/common/Layout.tsx
// Main application layout with navigation

import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Avatar as MuiAvatar,
  Menu,
  MenuItem,
  Badge,
  useTheme,
  useMediaQuery,
  Divider,
} from '@mui/material';
import {
  Menu as MenuIcon,
  ChatBubbleOutline,
  PaymentOutlined,
  AccountCircleOutlined,
  LogoutOutlined,
  NotificationsOutlined,
} from '@mui/icons-material';
import { useAuthStore } from '@/store/authStore';
import { useChatStore } from '@/store/chatStore';
import { logout as logoutApi } from '@/services/authService';
import { disconnectSocket } from '@/services/socket';
import { getInitials, getAvatarColor } from '@/utils/helpers';
import toast from 'react-hot-toast';

interface LayoutProps {
  children: React.ReactNode;
}

const DRAWER_WIDTH = 280;

/**
 * Main Layout Component
 * Navigation and app structure
 */
const Layout: React.FC<LayoutProps> = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();
  const location = useLocation();
  
  const { user, logout: logoutStore } = useAuthStore();
  const { unreadCount } = useChatStore();
  
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  
  /**
   * Navigation items
   */
  const navItems = [
    {
      label: 'Chat',
      icon: <ChatBubbleOutline />,
      path: '/chat',
      badge: unreadCount,
    },
    {
      label: 'Payments',
      icon: <PaymentOutlined />,
      path: '/payments',
    },
    {
      label: 'Profile',
      icon: <AccountCircleOutlined />,
      path: '/profile',
    },
  ];
  
  /**
   * Handle drawer toggle (mobile)
   */
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  /**
   * Handle profile menu
   */
  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };
  
  /**
   * Handle navigation
   */
  const handleNavigate = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };
  
  /**
   * Handle logout
   */
  const handleLogout = async () => {
    try {
      await logoutApi();
      disconnectSocket();
      logoutStore();
      toast.success('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API fails
      disconnectSocket();
      logoutStore();
      navigate('/login');
    }
  };
  
  /**
   * Drawer content
   */
  const drawerContent = (
    <Box>
      {/* Logo/Brand */}
      <Box
        sx={{
          p: 3,
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
        }}
      >
        <ChatBubbleOutline sx={{ fontSize: 32 }} />
        <Typography variant="h6" fontWeight={700}>
          Secure Chat
        </Typography>
      </Box>
      
      <Divider />
      
      {/* Navigation Items */}
      <List sx={{ px: 2, py: 2 }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          
          return (
            <ListItem key={item.path} disablePadding sx={{ mb: 1 }}>
              <ListItemButton
                onClick={() => handleNavigate(item.path)}
                sx={{
                  borderRadius: 2,
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'white' : 'text.primary',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: isActive ? 'white' : 'text.secondary',
                    minWidth: 40,
                  }}
                >
                  {item.badge ? (
                    <Badge badgeContent={item.badge} color="error">
                      {item.icon}
                    </Badge>
                  ) : (
                    item.icon
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontWeight: isActive ? 600 : 400,
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
  
  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          bgcolor: 'background.paper',
          borderBottom: 1,
          borderColor: 'divider',
        }}
      >
        <Toolbar>
          {/* Mobile menu button */}
          {isMobile && (
            <IconButton
              color="inherit"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, color: 'text.primary' }}
            >
              <MenuIcon />
            </IconButton>
          )}
          
          {/* Title */}
          <Typography
            variant="h6"
            sx={{
              flexGrow: 1,
              color: 'text.primary',
              fontWeight: 600,
            }}
          >
            {navItems.find((item) => item.path === location.pathname)?.label || 'Secure Chat'}
          </Typography>
          
          {/* Notifications */}
          <IconButton sx={{ color: 'text.primary' }}>
            <Badge badgeContent={unreadCount} color="error">
              <NotificationsOutlined />
            </Badge>
          </IconButton>
          
          {/* User Profile */}
          <IconButton onClick={handleProfileMenuOpen} sx={{ ml: 1 }}>
            <MuiAvatar
              sx={{
                width: 36,
                height: 36,
                bgcolor: getAvatarColor(user?.name || ''),
                fontSize: '0.9rem',
              }}
              src={user?.avatar}
            >
              {getInitials(user?.name || '')}
            </MuiAvatar>
          </IconButton>
          
          {/* Profile Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleProfileMenuClose}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
          >
            <Box sx={{ px: 2, py: 1.5, minWidth: 200 }}>
              <Typography variant="subtitle2" fontWeight={600}>
                {user?.name}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email}
              </Typography>
            </Box>
            <Divider />
            <MenuItem onClick={() => { handleNavigate('/profile'); handleProfileMenuClose(); }}>
              <ListItemIcon>
                <AccountCircleOutlined fontSize="small" />
              </ListItemIcon>
              Profile
            </MenuItem>
            <MenuItem onClick={handleLogout}>
              <ListItemIcon>
                <LogoutOutlined fontSize="small" />
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>
      
      {/* Drawer - Desktop */}
      {!isMobile && (
        <Drawer
          variant="permanent"
          sx={{
            width: DRAWER_WIDTH,
            flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              borderRight: 1,
              borderColor: 'divider',
            },
          }}
        >
          <Toolbar /> {/* Spacer for AppBar */}
          {drawerContent}
        </Drawer>
      )}
      
      {/* Drawer - Mobile */}
      {isMobile && (
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better mobile performance
          }}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
            },
          }}
        >
          {drawerContent}
        </Drawer>
      )}
      
      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar /> {/* Spacer for AppBar */}
        {children}
      </Box>
    </Box>
  );
};

export default Layout;