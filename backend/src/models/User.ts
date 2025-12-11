// src/models/User.ts
// User schema and model - Users collection ku structure define panrom

import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import { IUser } from '../types';

/**
 * User Schema
 * Fields: name, email, password, role, avatar, isOnline, lastSeen
 */
const UserSchema = new Schema<IUser>(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please provide a valid email',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Default query la password return aagadhu
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: null,
    },
    isOnline: {
      type: Boolean,
      default: false,
    },
    lastSeen: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt automatically add aagum
  }
);

/**
 * Pre-save middleware - Password a save panradhu munnadhi hash panrom
 */
UserSchema.pre('save', async function () {
  // Password modify aana time mattum hash panrom
  if (!this.isModified('password')) {
    return;
  }
  
  try {
    // Salt generate pannitu password hash panrom
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  } catch (error) {
    throw error;
  }
});

/**
 * Password compare panra method
 * Login time la password verify panradhu kaaga
 */
UserSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    return false;
  }
};

/**
 * Index create panrom - Performance improve kaaga
 */
UserSchema.index({ email: 1 }); // Email la search fast aagum
UserSchema.index({ isOnline: 1 }); // Online users filter fast aagum

// Model export panrom
export default mongoose.model<IUser>('User', UserSchema);