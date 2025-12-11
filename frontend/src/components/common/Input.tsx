// src/components/common/Input.tsx
// Reusable input component with validation display

import React from 'react';
import { TextField, TextFieldProps } from '@mui/material';

interface InputProps extends Omit<TextFieldProps, 'variant'> {
  variant?: 'outlined' | 'filled' | 'standard';
}

/**
 * Custom Input Component
 * Enhanced TextField with better styling
 */
const Input: React.FC<InputProps> = ({ variant = 'outlined', ...props }) => {
  return (
    <TextField
      variant={variant}
      fullWidth
      {...props}
      sx={{
        '& .MuiOutlinedInput-root': {
          borderRadius: 2,
          '&:hover fieldset': {
            borderColor: 'primary.main',
          },
        },
        ...props.sx,
      }}
    />
  );
};

export default Input;