// src/config/database.ts
// MongoDB connection setup - Database connect pannuradhu

import mongoose from 'mongoose';

/**
 * MongoDB database connect panra function
 * Environment variable la irrundhu URI edukrom
 */
export const connectDatabase = async (): Promise<void> => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/secure-chat';
    
    // MongoDB ku connect panrom
    await mongoose.connect(mongoUri);
    
    console.log('✅ MongoDB Connected Successfully');
    console.log(`📦 Database: ${mongoose.connection.name}`);
    
    // Connection events handle panrom
    mongoose.connection.on('error', (err) => {
      console.error('❌ MongoDB Connection Error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️ MongoDB Disconnected');
    });
    
  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error);
    process.exit(1); // Application a stop panrom if DB connect aagala
  }
};

/**
 * Database connection a gracefully close panra function
 */
export const closeDatabase = async (): Promise<void> => {
  try {
    await mongoose.connection.close();
    console.log('🔒 MongoDB Connection Closed');
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
  }
};