import mongoose from 'mongoose';
import '../config/env.js';
import { encodeMongoUri } from '../utils/mongoUri.js';

const connectDB = async ({ retry = true } = {}) => {
  const rawUri = process.env.MONGO_URI;
  if (!rawUri || rawUri.includes('YOUR_PASSWORD')) {
    console.error(
      'MONGO_URI is missing or still has YOUR_PASSWORD. Edit backend/.env with your Atlas password.'
    );
    process.exit(1);
  }

  const uri = encodeMongoUri(rawUri);

  try {
    const conn = await mongoose.connect(uri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err.message}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn('MongoDB disconnected.');
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected');
    });

    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    if (!retry || process.env.NODE_ENV === 'production') {
      throw error;
    }
    console.warn('MongoDB unavailable — retrying in 5 seconds. Check MONGO_URI in backend/.env');
    setTimeout(() => connectDB({ retry: true }), 5000);
  }
};

export default connectDB;
