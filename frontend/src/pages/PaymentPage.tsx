/* eslint-disable @typescript-eslint/no-unused-vars */
// src/pages/PaymentPage.tsx
// Payment dashboard - View and create payments

import React, { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Paper,
  Tabs,
  Tab,
  Chip,
} from '@mui/material';
import { AddCircleOutline, TrendingUp, CheckCircle, ErrorOutline } from '@mui/icons-material';
import Button from '@/components/common/Button';
import PaymentCard from '@/components/payment/PaymentCard';
import PaymentForm from '@/components/payment/PaymentForm';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import { Payment, CreatePaymentData } from '@/types';
import { getUserPayments, createPayment } from '@/services/paymentService';
import { formatCurrency } from '@/utils/helpers';
import toast from 'react-hot-toast';

/**
 * Payment Page Component
 * Dashboard for managing payments
 */
const PaymentPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'all' | 'completed' | 'pending' | 'failed'>('all');
  const [openPaymentForm, setOpenPaymentForm] = useState(false);
  
  // Statistics
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
  });
  
  /**
   * Load payments
   */
  useEffect(() => {
    loadPayments();
  }, [activeTab]);
  
  const loadPayments = async () => {
    setLoading(true);
    try {
      const status = activeTab === 'all' ? undefined : activeTab;
      const response = await getUserPayments(1, 50, status);
      
      const paymentsData = response.data.payments || [];
      setPayments(paymentsData);
      
      // Calculate stats
      calculateStats(paymentsData);
      
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setLoading(false);
    }
  };
  
  /**
   * Calculate statistics
   */
  const calculateStats = (paymentsData: Payment[]) => {
    const stats = {
      total: paymentsData.length,
      completed: paymentsData.filter((p) => p.status === 'completed').length,
      pending: paymentsData.filter((p) => p.status === 'pending').length,
      failed: paymentsData.filter((p) => p.status === 'failed').length,
      totalAmount: paymentsData
        .filter((p) => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0),
    };
    
    setStats(stats);
  };
  
  /**
   * Handle create payment
   */
  const handleCreatePayment = async (data: CreatePaymentData) => {
    try {
      const response = await createPayment(data);
      
      toast.success('Payment initiated successfully!');
      
      // Reload payments
      loadPayments();
      
    } catch (error) {
      console.error('Payment creation error:', error);
      throw error;
    }
  };
  
  /**
   * Filter payments based on active tab
   */
  const filteredPayments = payments;
  
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Payments
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage your payment transactions
          </Typography>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<AddCircleOutline />}
          onClick={() => setOpenPaymentForm(true)}
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          }}
        >
          New Payment
        </Button>
      </Box>
      
      {/* Statistics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TrendingUp />
              <Typography variant="body2">Total Payments</Typography>
            </Box>
            <Typography variant="h4" fontWeight={700}>
              {stats.total}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <CheckCircle />
              <Typography variant="body2">Completed</Typography>
            </Box>
            <Typography variant="h4" fontWeight={700}>
              {stats.completed}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <ErrorOutline />
              <Typography variant="body2">Pending</Typography>
            </Box>
            <Typography variant="h4" fontWeight={700}>
              {stats.pending}
            </Typography>
          </Paper>
        </Grid>
        
        <Grid item xs={12} sm={6} md={3}>
          <Paper
            sx={{
              p: 3,
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: 'white',
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <TrendingUp />
              <Typography variant="body2">Total Amount</Typography>
            </Box>
            <Typography variant="h4" fontWeight={700}>
              {formatCurrency(stats.totalAmount)}
            </Typography>
          </Paper>
        </Grid>
      </Grid>
      
      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(_, value) => setActiveTab(value)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab
            label="All"
            value="all"
            icon={<Chip label={stats.total} size="small" />}
            iconPosition="end"
          />
          <Tab
            label="Completed"
            value="completed"
            icon={<Chip label={stats.completed} size="small" color="success" />}
            iconPosition="end"
          />
          <Tab
            label="Pending"
            value="pending"
            icon={<Chip label={stats.pending} size="small" color="warning" />}
            iconPosition="end"
          />
          <Tab
            label="Failed"
            value="failed"
            icon={<Chip label={stats.failed} size="small" color="error" />}
            iconPosition="end"
          />
        </Tabs>
      </Paper>
      
      {/* Payments List */}
      {loading ? (
        <LoadingSpinner message="Loading payments..." fullScreen={false} />
      ) : filteredPayments.length === 0 ? (
        <EmptyState
          title="No payments found"
          description="You haven't made any payments yet. Click 'New Payment' to get started."
          actionLabel="Make Payment"
          onAction={() => setOpenPaymentForm(true)}
        />
      ) : (
        <Grid container spacing={3}>
          {filteredPayments.map((payment) => (
            <Grid item xs={12} sm={6} md={4} key={payment._id}>
              <PaymentCard payment={payment} />
            </Grid>
          ))}
        </Grid>
      )}
      
      {/* Payment Form Dialog */}
      <PaymentForm
        open={openPaymentForm}
        onClose={() => setOpenPaymentForm(false)}
        onSubmit={handleCreatePayment}
      />
    </Container>
  );
};

export default PaymentPage;