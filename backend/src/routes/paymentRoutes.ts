// src/routes/paymentRoutes.ts
// Payment related routes

import express from 'express';
import {
  createPayment,
  getUserPayments,
  getAllPayments,
  getPaymentDetails,
  getPaymentStats,
} from '../controllers/paymentController';
import { authenticate, authorizeAdmin } from '../middleware/auth';

const router = express.Router();

/**
 * All routes are protected - authenticate middleware apply panrom
 */
router.use(authenticate);

// Create payment - POST /api/payments/create
router.post('/create', createPayment);

// Get current user payments - GET /api/payments/my-payments
router.get('/my-payments', getUserPayments);

// Get specific payment details - GET /api/payments/:paymentId
router.get('/:paymentId', getPaymentDetails);

/**
 * Admin only routes
 */

// Get all payments (Admin) - GET /api/payments/all
router.get('/all', authorizeAdmin, getAllPayments);

// Get payment statistics (Admin) - GET /api/payments/stats
router.get('/stats', authorizeAdmin, getPaymentStats);

export default router;