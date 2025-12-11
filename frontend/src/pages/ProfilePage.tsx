// src/pages/ProfilePage.tsx
// User profile page

import React, { useState } from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Grid,
  TextField,
  Avatar as MuiAvatar,
  IconButton,
  Divider,
} from '@mui/material';
import { Edit, Save, Cancel, CameraAlt } from '@mui/icons-material';
import Button from '@/components/common/Button';
import { useAuthStore } from '@/store/authStore';
import { updateProfile } from '@/services/authService';
import { getInitials, getAvatarColor } from '@/utils/helpers';
import toast from 'react-hot-toast';
import { User } from '@/types';

/**
 * Profile Page Component
 * User profile view and edit
 */
const ProfilePage: React.FC = () => {
  const { user, updateUser } = useAuthStore();
  
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });
  
  /**
   * Handle input change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  /**
   * Handle save profile
   */
  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return;
    }
    
    setLoading(true);
    
    try {
  const response = await updateProfile({
    name: formData.name.trim(),
  });
  
  if (response.data) {
    updateUser(response.data as Partial<User>);
    setEditing(false);
    toast.success('Profile updated successfully!');
  } else {
    throw new Error('No data received from server');
  }
} catch (error) {
  console.error('Profile update error:', error);
  toast.error('Failed to update profile');
}
 finally {
      setLoading(false);
    }
  };
  
  /**
   * Handle cancel edit
   */
  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
    });
    setEditing(false);
  };
  
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Typography variant="h5" fontWeight={700}>
            Profile Settings
          </Typography>
          
          {!editing && (
            <Button
              variant="outlined"
              startIcon={<Edit />}
              onClick={() => setEditing(true)}
            >
              Edit Profile
            </Button>
          )}
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        {/* Avatar Section */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: 4,
          }}
        >
          <Box sx={{ position: 'relative' }}>
            <MuiAvatar
              src={user?.avatar}
              sx={{
                width: 120,
                height: 120,
                bgcolor: getAvatarColor(user?.name || ''),
                fontSize: '2.5rem',
                fontWeight: 700,
              }}
            >
              {getInitials(user?.name || '')}
            </MuiAvatar>
            
            {editing && (
              <IconButton
                sx={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  bgcolor: 'primary.main',
                  color: 'white',
                  '&:hover': {
                    bgcolor: 'primary.dark',
                  },
                }}
                size="small"
              >
                <CameraAlt fontSize="small" />
              </IconButton>
            )}
          </Box>
          
          <Typography variant="h6" fontWeight={600} sx={{ mt: 2 }}>
            {user?.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        
        <Divider sx={{ mb: 4 }} />
        
        {/* Profile Form */}
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Full Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              disabled={!editing}
              variant={editing ? 'outlined' : 'filled'}
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Email Address"
              name="email"
              value={formData.email}
              disabled
              variant="filled"
              helperText="Email cannot be changed"
            />
          </Grid>
          
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Role"
              value={user?.role || 'user'}
              disabled
              variant="filled"
            />
          </Grid>
        </Grid>
        
        {/* Action Buttons */}
        {editing && (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2,
              mt: 4,
            }}
          >
            <Button
              variant="outlined"
              startIcon={<Cancel />}
              onClick={handleCancel}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              startIcon={<Save />}
              onClick={handleSave}
              loading={loading}
            >
              Save Changes
            </Button>
          </Box>
        )}
        
        {/* Account Info */}
        <Box sx={{ mt: 6 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Account Information
          </Typography>
          <Divider sx={{ mb: 3 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Account Status
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                Active
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Member Since
              </Typography>
              <Typography variant="body1" fontWeight={600}>
                {new Date().toLocaleDateString('en-US', {
                  month: 'long',
                  year: 'numeric',
                })}
              </Typography>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
};

export default ProfilePage;