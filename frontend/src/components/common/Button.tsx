// src/components/common/Button.tsx
// Reusable custom button component

import React from 'react';
import { Button as MuiButton, ButtonProps, CircularProgress } from '@mui/material';

interface CustomButtonProps extends ButtonProps {
  loading?: boolean;
}

/**
 * Custom Button Component
 * MUI Button ku additional loading state add pannirkkom
 */
const Button: React.FC<CustomButtonProps> = ({ 
  loading = false, 
  disabled, 
  children, 
  ...props 
}) => {
  return (
    <MuiButton
      disabled={disabled || loading}
      {...props}
      sx={{
        position: 'relative',
        ...props.sx,
      }}
    >
      {loading && (
        <CircularProgress
          size={20}
          sx={{
            position: 'absolute',
            left: '50%',
            marginLeft: '-10px',
          }}
        />
      )}
      <span style={{ visibility: loading ? 'hidden' : 'visible' }}>
        {children}
      </span>
    </MuiButton>
  );
};

export default Button;