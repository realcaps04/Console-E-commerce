import mongoose from 'mongoose';

mongoose.set('bufferCommands', false);

export const requireDb = (req, res, next) => {
  if (mongoose.connection.readyState !== 1) {
    return res.status(503).json({
      success: false,
      message:
        'Database not connected. In MongoDB Atlas: Network Access → Add IP → Allow access from anywhere (0.0.0.0/0), then restart the backend.',
    });
  }
  next();
};

export const isDbConnected = () => mongoose.connection.readyState === 1;
