import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      maxPoolSize: 10,        // For traditional server: 10-20 connections ready
      minPoolSize: 5,         // Keep 5 connections warm for faster responses
      maxIdleTimeMS: 300000,  // Close idle connections after 5 minutes
      connectTimeoutMS: 5000, // Give 5 seconds to connect
      socketTimeoutMS: 30000  // Cancel operations taking >30 seconds
    });

    console.log('✓ MongoDB connected successfully');
    console.log(`✓ Connected to: ${process.env.MONGODB_URI}`);
    return mongoose.connection;
  } catch (error) {
    console.error('✗ MongoDB connection failed:', error.message);
    process.exit(1);
  }
};

export default connectDB;
