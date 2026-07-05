import User from '../models/User.js';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { AppError, asyncHandler, sendTokenResponse } from '../utils/apiResponse.js';
import { sendPasswordResetEmail } from '../services/emailService.js';
import { uploadToCloudinary, deleteFromCloudinary } from '../utils/cloudinaryUpload.js';

export const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new AppError('User already exists with this email', 400);
  }

  const user = await User.create({ name, email, password });

  sendTokenResponse(user, 201, res, 'Registration successful');
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password +refreshToken');
  if (!user) {
    throw new AppError('Invalid email or password', 401);
  }

  if (!user.isActive) {
    throw new AppError('Account has been deactivated', 401);
  }

  const isMatch = await user.matchPassword(password);
  if (!isMatch) {
    throw new AppError('Invalid email or password', 401);
  }

  user.lastLogin = new Date();
  await user.save({ validateBeforeSave: false });

  sendTokenResponse(user, 200, res, 'Login successful');
});

export const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    req.user.refreshToken = undefined;
    await req.user.save({ validateBeforeSave: false });
  }

  res
    .cookie('token', 'none', { expires: new Date(Date.now()), httpOnly: true })
    .cookie('refreshToken', 'none', { expires: new Date(Date.now()), httpOnly: true })
    .status(200)
    .json({ success: true, message: 'Logged out successfully' });
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .populate('wishlist', 'name price images ratings slug')
    .lean();

  res.status(200).json({ success: true, user });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, addresses } = req.body;

  const user = await User.findById(req.user._id);

  if (name) user.name = name;
  if (phone) user.phone = phone;
  if (addresses) user.addresses = addresses;

  if (req.file) {
    if (user.avatar?.public_id) {
      await deleteFromCloudinary(user.avatar.public_id);
    }
    const uploaded = await uploadToCloudinary(req.file.path, 'console-ecommerce/avatars');
    user.avatar = uploaded;
  }

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Profile updated successfully',
    user,
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return res.status(200).json({
      success: true,
      message: 'If an account exists, a reset email has been sent',
    });
  }

  const resetToken = user.getResetPasswordToken();
  await user.save({ validateBeforeSave: false });

  try {
    await sendPasswordResetEmail(user.email, resetToken);
    res.status(200).json({
      success: true,
      message: 'Password reset email sent',
    });
  } catch {
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save({ validateBeforeSave: false });
    throw new AppError('Email could not be sent', 500);
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  const resetPasswordToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    throw new AppError('Invalid or expired reset token', 400);
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res, 'Password reset successful');
});

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken: token } = req.body;

  if (!token) {
    throw new AppError('Refresh token is required', 400);
  }

  const decoded = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
  const user = await User.findById(decoded.id).select('+refreshToken');

  if (!user || user.refreshToken !== token) {
    throw new AppError('Invalid refresh token', 401);
  }

  sendTokenResponse(user, 200, res, 'Token refreshed');
});

export const deleteAccount = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);

  user.isActive = false;
  user.email = `deleted_${Date.now()}_${user.email}`;
  await user.save();

  res
    .cookie('token', 'none', { expires: new Date(Date.now()), httpOnly: true })
    .status(200)
    .json({ success: true, message: 'Account deleted successfully' });
});

export const addToWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.productId;

  if (user.wishlist.includes(productId)) {
    user.wishlist = user.wishlist.filter((id) => id.toString() !== productId);
  } else {
    user.wishlist.push(productId);
  }

  await user.save();
  await user.populate('wishlist', 'name price images ratings slug');

  res.status(200).json({
    success: true,
    message: 'Wishlist updated',
    wishlist: user.wishlist,
  });
});

export const addRecentlyViewed = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  const productId = req.params.productId;

  user.recentlyViewed = user.recentlyViewed.filter(
    (item) => item.product.toString() !== productId
  );
  user.recentlyViewed.unshift({ product: productId, viewedAt: new Date() });
  user.recentlyViewed = user.recentlyViewed.slice(0, 20);

  await user.save();

  res.status(200).json({ success: true, message: 'Recently viewed updated' });
});

export const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const query = { role: 'user' };
  if (req.query.search) {
    query.$or = [
      { name: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const [users, total] = await Promise.all([
    User.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }).lean(),
    User.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    users,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) {
    throw new AppError('User not found', 404);
  }

  user.isActive = false;
  await user.save();

  res.status(200).json({ success: true, message: 'User deactivated' });
});
