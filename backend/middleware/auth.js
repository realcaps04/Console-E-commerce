import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { AppError, asyncHandler } from '../utils/apiResponse.js';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (!token) {
    throw new AppError('Not authorized to access this route', 401);
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select('-password');

    if (!req.user) {
      throw new AppError('User not found', 401);
    }

    if (!req.user.isActive) {
      throw new AppError('Account has been deactivated', 401);
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Token expired, please login again', 401);
    }
    throw new AppError('Not authorized to access this route', 401);
  }
});

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new AppError(
        `Role '${req.user.role}' is not authorized to access this route`,
        403
      );
    }
    next();
  };
};

export const optionalAuth = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
    } catch {
      req.user = null;
    }
  }

  next();
});
