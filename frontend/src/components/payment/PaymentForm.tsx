// src/components/payment/PaymentForm.tsx
// Payment creation form

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  TextField,
  ToggleButtonGroup,
  ToggleButton,
  InputAdornment,
  Stack,
} from '@mui/material';
import {
  CreditCard,
  AccountBalanceWallet,
  AccountBalance,
} from '@mui/icons-material';
import Button from '@/components/common/Button';
import { CreatePaymentData } from '@/types';

interface PaymentFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePaymentData) => Promise<void>;
}

/**
 * Payment Form Component
 * Form for creating new payment
 */
const PaymentForm: React.FC<PaymentFormProps> = ({ open, onClose, onSubmit }) => {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
  const [formData, setFormData] = useState({
    amount: '',
    cardNumber: '',
    phone: '',
    upiId: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  
  /**
   * Handle input change
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };
  
  /**
   * Validate form
   */
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    
    // Amount validation
    const amount = parseFloat(formData.amount);
    if (!formData.amount) {
      newErrors.amount = 'Amount is required';
    } else if (isNaN(amount) || amount <= 0) {
      newErrors.amount = 'Invalid amount';
    } else if (amount > 1000000) {
      newErrors.amount = 'Amount cannot exceed ₹10,00,000';
    }
    
    // Payment method specific validation
    if (paymentMethod === 'card') {
      if (!formData.cardNumber) {
        newErrors.cardNumber = 'Card number is required';
      } else if (formData.cardNumber.replace(/\s/g, '').length < 13) {
        newErrors.cardNumber = 'Invalid card number';
      }
    } else if (paymentMethod === 'upi') {
      if (!formData.phone && !formData.upiId) {
        newErrors.phone = 'Phone or UPI ID is required';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  /**
   * Handle submit
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      const paymentData: CreatePaymentData = {
        amount: parseFloat(formData.amount),
        paymentMethod,
      };
      
      // Add payment method specific data
      if (paymentMethod === 'card') {
        paymentData.cardNumber = formData.cardNumber.replace(/\s/g, '');
      } else if (paymentMethod === 'upi') {
        if (formData.phone) {
          paymentData.phone = formData.phone;
        } else {
          paymentData.upiId = formData.upiId;
        }
      }
      
      await onSubmit(paymentData);
      
      // Reset form
      setFormData({
        amount: '',
        cardNumber: '',
        phone: '',
        upiId: '',
      });
      onClose();
      
    } catch (error) {
      console.error('Payment error:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Typography variant="h6" fontWeight={600}>
            Make Payment
          </Typography>
        </DialogTitle>
        
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            {/* Amount Input */}
            <TextField
              fullWidth
              label="Amount"
              name="amount"
              type="number"
              placeholder="Enter amount"
              value={formData.amount}
              onChange={handleChange}
              error={!!errors.amount}
              helperText={errors.amount}
              InputProps={{
                startAdornment: <InputAdornment position="start">₹</InputAdornment>,
              }}
            />
            
            {/* Payment Method Selection */}
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Payment Method
              </Typography>
              <ToggleButtonGroup
                value={paymentMethod}
                exclusive
                onChange={(_, value) => value && setPaymentMethod(value)}
                fullWidth
              >
                <ToggleButton value="card">
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <CreditCard />
                    <Typography variant="caption">Card</Typography>
                  </Box>
                </ToggleButton>
                <ToggleButton value="upi">
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <AccountBalanceWallet />
                    <Typography variant="caption">UPI</Typography>
                  </Box>
                </ToggleButton>
                <ToggleButton value="netbanking">
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                    <AccountBalance />
                    <Typography variant="caption">Net Banking</Typography>
                  </Box>
                </ToggleButton>
              </ToggleButtonGroup>
            </Box>
            
            {/* Payment Method Specific Fields */}
            {paymentMethod === 'card' && (
              <TextField
                fullWidth
                label="Card Number"
                name="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={formData.cardNumber}
                onChange={handleChange}
                error={!!errors.cardNumber}
                helperText={errors.cardNumber}
              />
            )}
            
            {paymentMethod === 'upi' && (
              <>
                <TextField
                  fullWidth
                  label="Phone Number"
                  name="phone"
                  placeholder="Enter phone number"
                  value={formData.phone}
                  onChange={handleChange}
                  error={!!errors.phone}
                  helperText={errors.phone || 'Or use UPI ID below'}
                />
                <TextField
                  fullWidth
                  label="UPI ID"
                  name="upiId"
                  placeholder="username@upi"
                  value={formData.upiId}
                  onChange={handleChange}
                />
              </>
            )}
          </Stack>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            loading={loading}
          >
            Pay Now
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default PaymentForm;