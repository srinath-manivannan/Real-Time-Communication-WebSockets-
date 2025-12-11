/* eslint-disable @typescript-eslint/no-unused-vars */
// src/components/payment/PaymentCard.tsx
// Individual payment card display

import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Chip,
  IconButton,
  Divider,
} from '@mui/material';
import {
  CreditCard,
  AccountBalanceWallet,
  AccountBalance,
  MoreVert,
} from '@mui/icons-material';
import { Payment } from '@/types';
import { formatCurrency, formatDateTime } from '@/utils/helpers';

interface PaymentCardProps {
  payment: Payment;
  onClick?: () => void;
}

/**
 * Payment Card Component
 * Displays payment information in a card
 */
const PaymentCard: React.FC<PaymentCardProps> = ({ payment, onClick }) => {
  /**
   * Get payment method icon
   */
  const getPaymentIcon = () => {
    switch (payment.paymentMethod) {
      case 'card':
        return <CreditCard />;
      case 'upi':
        return <AccountBalanceWallet />;
      case 'netbanking':
        return <AccountBalance />;
      default:
        return <CreditCard />;
    }
  };
  
  /**
   * Get status color
   */
  const getStatusColor = () => {
    switch (payment.status) {
      case 'completed':
        return 'success';
      case 'pending':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };
  
  return (
    <Card
      onClick={onClick}
      sx={{
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        '&:hover': onClick
          ? {
              transform: 'translateY(-4px)',
              boxShadow: 4,
            }
          : {},
      }}
    >
      <CardContent>
        {/* Header */}
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            mb: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 2,
                bgcolor: 'primary.light',
                color: 'primary.main',
                display: 'flex',
              }}
            >
              {getPaymentIcon()}
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {payment.paymentMethod.toUpperCase()}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {formatDateTime(payment.createdAt)}
              </Typography>
            </Box>
          </Box>
          
          <Chip
            label={payment.status.toUpperCase()}
            color={getStatusColor()}
            size="small"
          />
        </Box>
        
        <Divider sx={{ my: 2 }} />
        
        {/* Amount */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Amount
          </Typography>
          <Typography variant="h6" fontWeight={700} color="primary.main">
            {formatCurrency(payment.amount)}
          </Typography>
        </Box>
        
        {/* Transaction ID */}
        <Box>
          <Typography variant="caption" color="text.secondary">
            Transaction ID
          </Typography>
          <Typography variant="body2" fontFamily="monospace">
            {payment.transactionId}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

export default PaymentCard;