// src/controllers/paymentController.ts
// Payment related controllers with encryption

import { Response } from 'express';
import mongoose from 'mongoose';
import Payment from '../models/Payment';
import { IAuthRequest, IPayment } from '../types';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { encrypt, decrypt, generateToken } from '../utils/encryption';
import {
  isValidAmount,
  isValidCardNumber,
  isValidPhone,
  isValidUPI,
} from '../utils/validation';

/**
 * Create Payment
 * POST /api/payments/create
 */
export const createPayment = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const {
      amount,
      paymentMethod,
      cardNumber,
      phone,
      upiId,
    } = req.body;
    
    console.log('💳 Payment request:', { userId, amount, paymentMethod });
    
    // Input validation
    if (!amount || !paymentMethod) {
      throw new AppError('Amount and payment method are required', 400);
    }
    
    // Amount validate panrom
    if (!isValidAmount(amount)) {
      throw new AppError('Invalid amount. Must be between 1 and 10,00,000', 400);
    }
    
    // Payment method validation
    if (!['card', 'upi', 'netbanking'].includes(paymentMethod)) {
      throw new AppError('Invalid payment method', 400);
    }
    
    // Payment method specific validation
    let cardNumberEncrypted: string | undefined = undefined;
    let phoneEncrypted: string | undefined = undefined;
    
    if (paymentMethod === 'card') {
      if (!cardNumber) {
        throw new AppError('Card number is required', 400);
      }
      
      // More lenient validation
      const cleanCard = cardNumber.replace(/[\s-]/g, '');
      if (cleanCard.length < 13 || cleanCard.length > 19) {
        throw new AppError('Card number must be between 13-19 digits', 400);
      }
      
      // Card number encrypt panrom
      try {
        cardNumberEncrypted = encrypt(cleanCard);
      } catch (error) {
        console.error('Card encryption error:', error);
        throw new AppError('Failed to process card number', 500);
      }
    }
    
    if (paymentMethod === 'upi') {
      if (phone) {
        if (!isValidPhone(phone)) {
          throw new AppError('Invalid phone number', 400);
        }
        phoneEncrypted = encrypt(phone);
      } else if (upiId) {
        if (!isValidUPI(upiId)) {
          throw new AppError('Invalid UPI ID', 400);
        }
        phoneEncrypted = encrypt(upiId);
      } else {
        throw new AppError('Phone number or UPI ID is required', 400);
      }
    }
    
    // Unique transaction ID generate panrom
    const transactionId = `TXN${Date.now()}${generateToken(8)}`;
    
    console.log('💾 Creating payment with userId:', userId);
    
    // Payment create panrom
    try {
      const paymentDoc = new Payment({
        userId: new mongoose.Types.ObjectId(userId),
        amount: Number(amount),
        paymentMethod,
        transactionId,
        cardNumberEncrypted,
        phoneEncrypted,
        status: 'pending',
      });
      
      const payment = await paymentDoc.save();
      
      console.log('✅ Payment created:', payment._id);
      
      // Simulate payment processing
      setTimeout(async () => {
        try {
          const paymentToUpdate = await Payment.findById(payment._id);
          if (paymentToUpdate) {
            paymentToUpdate.status = 'completed';
            await paymentToUpdate.save();
            console.log('✅ Payment completed:', payment._id);
          }
        } catch (error) {
          console.error('Payment update error:', error);
        }
      }, 2000);
      
      res.status(201).json({
        success: true,
        message: 'Payment initiated successfully',
        data: {
          paymentId: payment._id.toString(),
          transactionId: payment.transactionId,
          amount: payment.amount,
          paymentMethod: payment.paymentMethod,
          status: payment.status,
          createdAt: payment.createdAt,
        },
      });
    } catch (error: any) {
      console.error('❌ Payment creation error:', error);
      throw new AppError(error.message || 'Failed to create payment', 500);
    }
  }
);

/**
 * Get User Payments (with user details - Aggregation)
 * GET /api/payments/my-payments
 */
export const getUserPayments = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const { page = 1, limit = 10, status } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    const userObjectId = new mongoose.Types.ObjectId(userId);
    
    const filter: any = { userId: userObjectId };
    if (status) {
      filter.status = status;
    }
    
    const payments = await Payment.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: '$userDetails' },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
      {
        $project: {
          _id: 1,
          amount: 1,
          paymentMethod: 1,
          transactionId: 1,
          status: 1,
          createdAt: 1,
          user: {
            id: '$userDetails._id',
            name: '$userDetails.name',
            email: '$userDetails.email',
          },
          cardLast4: {
            $cond: {
              if: { $ne: ['$cardNumberEncrypted', null] },
              then: '****',
              else: null,
            },
          },
          phonePartial: {
            $cond: {
              if: { $ne: ['$phoneEncrypted', null] },
              then: '******',
              else: null,
            },
          },
        },
      },
    ]);
    
    const totalCount = await Payment.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalCount / Number(limit)),
          totalCount,
          limit: Number(limit),
        },
      },
    });
  }
);

/**
 * Get All Payments (Admin only - with full user details)
 * GET /api/payments/all
 */
export const getAllPayments = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { page = 1, limit = 20, status } = req.query;
    
    const skip = (Number(page) - 1) * Number(limit);
    const matchFilter: any = {};
    if (status) {
      matchFilter.status = status;
    }
    
    const payments = await Payment.aggregate([
      { $match: matchFilter },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userDetails',
        },
      },
      { $unwind: '$userDetails' },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: Number(limit) },
      {
        $project: {
          _id: 1,
          amount: 1,
          paymentMethod: 1,
          transactionId: 1,
          status: 1,
          createdAt: 1,
          user: {
            id: '$userDetails._id',
            name: '$userDetails.name',
            email: '$userDetails.email',
            role: '$userDetails.role',
          },
        },
      },
    ]);
    
    const totalCount = await Payment.countDocuments(matchFilter);
    
    res.status(200).json({
      success: true,
      data: {
        payments,
        pagination: {
          currentPage: Number(page),
          totalPages: Math.ceil(totalCount / Number(limit)),
          totalCount,
          limit: Number(limit),
        },
      },
    });
  }
);

/**
 * Get Payment Details (decrypt sensitive data if authorized)
 * GET /api/payments/:paymentId
 */
export const getPaymentDetails = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const userRole = req.user?.role;
    const { paymentId } = req.params;
    
    const payment = await Payment.findById(paymentId).populate(
      'userId',
      'name email role'
    );
    
    if (!payment) {
      throw new AppError('Payment not found', 404);
    }
    
    if (payment.userId.toString() !== userId && userRole !== 'admin') {
      throw new AppError('Unauthorized to view this payment', 403);
    }
    
    let decryptedCardNumber = null;
    let decryptedPhone = null;
    
    if (payment.cardNumberEncrypted) {
      const fullCard = decrypt(payment.cardNumberEncrypted);
      decryptedCardNumber = `**** **** **** ${fullCard.slice(-4)}`;
    }
    
    if (payment.phoneEncrypted) {
      const fullPhone = decrypt(payment.phoneEncrypted);
      decryptedPhone = `******${fullPhone.slice(-4)}`;
    }
    
    res.status(200).json({
      success: true,
      data: {
        _id: payment._id.toString(),
        amount: payment.amount,
        paymentMethod: payment.paymentMethod,
        transactionId: payment.transactionId,
        status: payment.status,
        cardNumber: decryptedCardNumber,
        phone: decryptedPhone,
        createdAt: payment.createdAt,
        user: payment.userId,
      },
    });
  }
);

/**
 * Get Payment Statistics (Admin)
 * GET /api/payments/stats
 */
export const getPaymentStats = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);
    
    const methodStats = await Payment.aggregate([
      {
        $group: {
          _id: '$paymentMethod',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);
    
    res.status(200).json({
      success: true,
      data: {
        statusWise: stats,
        methodWise: methodStats,
      },
    });
  }
);