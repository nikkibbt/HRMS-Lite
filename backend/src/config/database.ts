import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/hrms-lite';


// export const connectDatabase = async (): Promise<void> => {
//   try {
//     await mongoose.connect(MONGODB_URI);
//     console.log('✅ MongoDB connected successfully');
//   } catch (error) {
//     console.error('❌ MongoDB connection error:', error);
//     process.exit(1);
//   }
// };
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('CRITICAL: MONGODB_URI is missing');
  process.exit(1);
}

export const connectDatabase = async (): Promise<void> => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};