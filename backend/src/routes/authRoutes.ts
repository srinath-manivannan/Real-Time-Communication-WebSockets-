// src/routes/authRoutes.ts
// Authentication related routes define panrom

import express from 'express';
import {
  register,
  login,
  getProfile,
  updateProfile,
  logout,
  getAllUsers,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = express.Router();

/**
 * Public Routes (Authentication vendam)
 */

// User registration - POST /api/auth/register
router.post('/register', register);

// User login - POST /api/auth/login
router.post('/login', login);

/**
 * Protected Routes (Authentication venum)
 * Indha routes ku munnadhi authenticate middleware run aagum
 */

// Get current user profile - GET /api/auth/profile
router.get('/profile', authenticate, getProfile);

// Update user profile - PUT /api/auth/profile
router.put('/profile', authenticate, updateProfile);

// Logout user - POST /api/auth/logout
router.post('/logout', authenticate, logout);

// Get all users (for chat list) - GET /api/auth/users
router.get('/users', authenticate, getAllUsers);

export default router;