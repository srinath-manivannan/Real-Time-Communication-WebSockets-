// src/models/Payment.ts
// Payment schema - Payment details encrypted form la store aagum

import mongoose, { Schema } from 'mongoose';
import { IPayment } from '../types';

/**
 * Payment Schema
 * Sensitive data like card numbers, phone encrypted aagum
 */
const PaymentSchema = new Schema<IPayment>(
  {
    userId: {
       type: mongoose.Schema.Types.ObjectId, // ObjectId type ah properly define panrom
      required: [true, 'User ID is required'],
      ref: 'User', // User collection reference
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount must be positive'],
    },
    paymentMethod: {
      type: String,
      enum: ['card', 'upi', 'netbanking'],
      required: [true, 'Payment method is required'],
    },
    transactionId: {
      type: String,
      required: [true, 'Transaction ID is required'],
      unique: true,
    },
    cardNumberEncrypted: {
      type: String,
      default: null, // Card payment la mattum irukum
    },
    phoneEncrypted: {
      type: String,
      default: null, // UPI payment la mattum irukum
    },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

/**
 * Indexes for performance
 */
PaymentSchema.index({ userId: 1, createdAt: -1 }); // User payments history
PaymentSchema.index({ transactionId: 1 }); // Transaction lookup
PaymentSchema.index({ status: 1 }); // Status wise filter

// Model export
export default mongoose.model<IPayment>('Payment', PaymentSchema);