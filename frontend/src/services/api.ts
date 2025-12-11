/* eslint-disable @typescript-eslint/no-explicit-any */
// src/services/api.ts
// Axios setup with interceptors - API calls ku

import axios, { AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';

// Base URL - Backend API URL
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Axios instance create panrom with default config
 */
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds
});

/**
 * Request Interceptor
 * Every request ku munnadhi token attach panrom
 */
api.interceptors.request.use(
  (config) => {
    // LocalStorage la irrundhu token edukrom
    const token = localStorage.getItem('token');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Error handling and token expiry check
 */
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError<any>) => {
    // Network error
    if (!error.response) {
      toast.error('Network error. Please check your connection.');
      return Promise.reject(error);
    }
    
    const { status, data } = error.response;
    
    // Handle different error status codes
    switch (status) {
      case 401:
        // Unauthorized - Token expired or invalid
        toast.error('Session expired. Please login again.');
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
        break;
        
      case 403:
        // Forbidden
        toast.error(data?.message || 'Access denied.');
        break;
        
      case 404:
        // Not found
        toast.error(data?.message || 'Resource not found.');
        break;
        
      case 500:
        // Server error
        toast.error('Server error. Please try again later.');
        break;
        
      default:
        // Other errors
        toast.error(data?.message || 'Something went wrong.');
    }
    
    return Promise.reject(error);
  }
);

export default api;