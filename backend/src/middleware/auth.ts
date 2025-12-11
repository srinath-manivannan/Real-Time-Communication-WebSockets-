// src/middleware/auth.ts
// JWT token verify panni user authenticate panrom

import { Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { IAuthRequest, IJWTPayload } from '../types';

/**
 * JWT token verify panra middleware
 * Protected routes ku munnadhi indha middleware run aagum
 */
export const authenticate = async (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Header la irrundhu token edukrom
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.',
      });
      return;
    }
    
    // "Bearer " remove panni token edukrom
    const token = authHeader.substring(7);
    
    // JWT secret key
    const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
    
    // Token verify panrom
    const decoded = jwt.verify(token, jwtSecret) as IJWTPayload;
    
    // Decoded data request object la attach panrom
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role,
    };
    
    // Next middleware ku pass panrom
    next();
  } catch (error: any) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({
        success: false,
        message: 'Token expired. Please login again.',
      });
      return;
    }
    
    res.status(401).json({
      success: false,
      message: 'Invalid token.',
      error: error.message,
    });
  }
};

/**
 * Role-based access control middleware
 * Admin routes ku mattum access allow panrom
 */
export const authorizeAdmin = (
  req: IAuthRequest,
  res: Response,
  next: NextFunction
): void => {
  if (req.user?.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Access denied. Admin privileges required.',
    });
    return;
  }
  
  next();
};

/**
 * JWT token generate panra function
 */
export const generateToken = (payload: IJWTPayload): string => {
  const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
  
  // Token 7 days ku valid aagum
  return jwt.sign(payload, jwtSecret, {
    expiresIn: '7d',
  });
};

/**
 * Refresh token generate panrom (optional - future use kaaga)
 */
export const generateRefreshToken = (payload: IJWTPayload): string => {
  const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret';
  
  // Refresh token 30 days ku valid
  return jwt.sign(payload, jwtSecret + '_refresh', {
    expiresIn: '30d',
  });
};