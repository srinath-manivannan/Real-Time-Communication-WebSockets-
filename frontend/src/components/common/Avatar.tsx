// src/components/common/Avatar.tsx
// Custom avatar component with online indicator

import React from 'react';
import { Avatar as MuiAvatar, AvatarProps, Badge, styled } from '@mui/material';
import { getInitials, getAvatarColor } from '@/utils/helpers';

interface CustomAvatarProps extends AvatarProps {
  name: string;
  isOnline?: boolean;
  showOnlineIndicator?: boolean;
}

/**
 * Styled Badge for online indicator
 */
const StyledBadge = styled(Badge)(({ theme }) => ({
  '& .MuiBadge-badge': {
    backgroundColor: '#44b700',
    color: '#44b700',
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    '&::after': {
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      animation: 'ripple 1.2s infinite ease-in-out',
      border: '1px solid currentColor',
      content: '""',
    },
  },
  '@keyframes ripple': {
    '0%': {
      transform: 'scale(.8)',
      opacity: 1,
    },
    '100%': {
      transform: 'scale(2.4)',
      opacity: 0,
    },
  },
}));

/**
 * Custom Avatar Component
 * Shows user avatar with optional online indicator
 */
const Avatar: React.FC<CustomAvatarProps> = ({
  name,
  isOnline = false,
  showOnlineIndicator = false,
  src,
  sx,
  ...props
}) => {
  const initials = getInitials(name);
  const bgColor = getAvatarColor(name);
  
  const avatar = (
    <MuiAvatar
      src={src}
      {...props}
      sx={{
        bgcolor: src ? 'transparent' : bgColor,
        fontWeight: 600,
        ...sx,
      }}
    >
      {!src && initials}
    </MuiAvatar>
  );
  
  if (showOnlineIndicator && isOnline) {
    return (
      <StyledBadge
        overlap="circular"
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        variant="dot"
      >
        {avatar}
      </StyledBadge>
    );
  }
  
  return avatar;
};

export default Avatar;