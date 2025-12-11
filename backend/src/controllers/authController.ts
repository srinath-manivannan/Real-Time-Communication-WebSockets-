// src/controllers/authController.ts
// Authentication related controllers - Register, Login, Profile

import { Response } from 'express';
import User from '../models/User';
import { IAuthRequest } from '../types';
import { AppError, asyncHandler } from '../middleware/errorHandler';
import { generateToken } from '../middleware/auth';
import { isValidEmail, isValidPassword, sanitizeString } from '../utils/validation';

/**
 * User Registration
 * POST /api/auth/register
 */
export const register = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { name, email, password, role } = req.body;
    
    // Input validation
    if (!name || !email || !password) {
      throw new AppError('Please provide all required fields', 400);
    }
    
    // Email validate panrom
    if (!isValidEmail(email)) {
      throw new AppError('Please provide a valid email', 400);
    }
    
    // Password strength check
    if (!isValidPassword(password)) {
      throw new AppError(
        'Password must be at least 6 characters with letters and numbers',
        400
      );
    }
    
    // User already exists ah check panrom
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new AppError('Email already registered', 400);
    }
    
    // Sanitize name
    const sanitizedName = sanitizeString(name);
    
    // New user create panrom
    const user = await User.create({
      name: sanitizedName,
      email: email.toLowerCase(),
      password,
      role: role || 'user',
    });
    
    // JWT token generate panrom
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    
    // Response send panrom (password exclude)
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
        },
        token,
      },
    });
  }
);

/**
 * User Login
 * POST /api/auth/login
 */
export const login = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const { email, password } = req.body;
    
    // Input validation
    if (!email || !password) {
      throw new AppError('Please provide email and password', 400);
    }
    
    // User find panrom (password include pannanumnu specifically mention panrom)
    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    
    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }
    
    // Password verify panrom
    const isPasswordValid = await user.comparePassword(password);
    
    if (!isPasswordValid) {
      throw new AppError('Invalid email or password', 401);
    }
    
    // User online status update panrom
    user.isOnline = true;
    user.lastSeen = new Date();
    await user.save();
    
    // JWT token generate panrom
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
    });
    
    // Response send panrom
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          avatar: user.avatar,
          isOnline: user.isOnline,
        },
        token,
      },
    });
  }
);

/**
 * Get Current User Profile
 * GET /api/auth/profile
 */
export const getProfile = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    // req.user la irrundhu userId edukrom (auth middleware set pannirukum)
    const userId = req.user?.userId;
    
    // User details fetch panrom
    const user = await User.findById(userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        isOnline: user.isOnline,
        lastSeen: user.lastSeen,
        createdAt: user.createdAt,
      },
    });
  }
);

/**
 * Update User Profile
 * PUT /api/auth/profile
 */
export const updateProfile = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    const { name, avatar } = req.body;
    
    // User find panni update panrom
    const user = await User.findById(userId);
    
    if (!user) {
      throw new AppError('User not found', 404);
    }
    
    // Update fields
    if (name) user.name = sanitizeString(name);
    if (avatar) user.avatar = avatar;
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });
  }
);

/**
 * Logout User
 * POST /api/auth/logout
 */
export const logout = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const userId = req.user?.userId;
    
    // User offline status update panrom
    await User.findByIdAndUpdate(userId, {
      isOnline: false,
      lastSeen: new Date(),
    });
    
    res.status(200).json({
      success: true,
      message: 'Logout successful',
    });
  }
);

/**
 * Get All Users (for chat list)
 * GET /api/auth/users
 */
export const getAllUsers = asyncHandler(
  async (req: IAuthRequest, res: Response): Promise<void> => {
    const currentUserId = req.user?.userId;
    
    // Current user except panni ella users edukrom
    const users = await User.find({ _id: { $ne: currentUserId } })
      .select('name email avatar isOnline lastSeen')
      .sort({ isOnline: -1, lastSeen: -1 }); // Online users first
    
    res.status(200).json({
      success: true,
      data: users,
    });
  }
);