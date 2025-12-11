// src/services/authService.ts
// Authentication related API calls

import api from './api';
import { LoginCredentials, RegisterData, User, AuthResponse, ApiResponse } from '@/types';

/**
 * User register panradhu
 */
export const register = async (data: RegisterData): Promise<ApiResponse<AuthResponse>> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', data);
  return response.data;
};

/**
 * User login panradhu
 */
export const login = async (credentials: LoginCredentials): Promise<ApiResponse<AuthResponse>> => {
  const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', credentials);
  return response.data;
};

/**
 * Logout panradhu
 */
export const logout = async (): Promise<ApiResponse<null>> => {
  const response = await api.post<ApiResponse<null>>('/auth/logout');
  return response.data;
};

/**
 * Get current user profile
 */
export const getProfile = async (): Promise<ApiResponse<User>> => {
  const response = await api.get<ApiResponse<User>>('/auth/profile');
  return response.data;
};

/**
 * Update user profile
 */
export const updateProfile = async (data: {
  name?: string;
  avatar?: string;
}): Promise<ApiResponse<User>> => {
  const response = await api.put<ApiResponse<User>>('/auth/profile', data);
  return response.data;
};

/**
 * Get all users (for chat)
 */
export const getAllUsers = async (): Promise<ApiResponse<User[]>> => {
  const response = await api.get<ApiResponse<User[]>>('/auth/users');
  
  // Ensure each user has both id and _id
  if (response.data.success && response.data.data) {
    response.data.data = response.data.data.map(user => ({
      ...user,
      id: user.id || user._id || '',
      _id: user._id || user.id || '',
    }));
  }
  
  return response.data;
};