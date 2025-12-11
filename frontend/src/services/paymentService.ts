/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/paymentService.ts
// Payment related API calls

import api from './api';
import { Payment, CreatePaymentData, ApiResponse } from '@/types';

/**
 * Create payment
 */
export const createPayment = async (
  data: CreatePaymentData
): Promise<ApiResponse<Payment>> => {
  const response = await api.post<ApiResponse<Payment>>('/payments/create', data);
  return response.data;
};

/**
 * Get user payments
 */
export const getUserPayments = async (
  page: number = 1,
  limit: number = 10,
  status?: string
): Promise<ApiResponse<{ payments: Payment[]; pagination: any }>> => {
  const response = await api.get<ApiResponse<{ payments: Payment[]; pagination: any }>>(
    '/payments/my-payments',
    {
      params: { page, limit, status },
    }
  );
  return response.data;
};

/**
 * Get payment details
 */
export const getPaymentDetails = async (
  paymentId: string
): Promise<ApiResponse<Payment>> => {
  const response = await api.get<ApiResponse<Payment>>(`/payments/${paymentId}`);
  return response.data;
};

/**
 * Get all payments (Admin only)
 */
export const getAllPayments = async (
  page: number = 1,
  limit: number = 20,
  status?: string
): Promise<ApiResponse<{ payments: Payment[]; pagination: any }>> => {
  const response = await api.get<ApiResponse<{ payments: Payment[]; pagination: any }>>(
    '/payments/all',
    {
      params: { page, limit, status },
    }
  );
  return response.data;
};

/**
 * Get payment statistics (Admin only)
 */
export const getPaymentStats = async (): Promise<ApiResponse<{
  statusWise: Array<{ _id: string; count: number; totalAmount: number }>;
  methodWise: Array<{ _id: string; count: number; totalAmount: number }>;
}>> => {
  const response = await api.get<ApiResponse<{
    statusWise: Array<{ _id: string; count: number; totalAmount: number }>;
    methodWise: Array<{ _id: string; count: number; totalAmount: number }>;
  }>>('/payments/stats');
  return response.data;
};