import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  forgotPassword,
  resetPassword,
  refreshToken,
  deleteAccount,
  addToWishlist,
  getAllUsers,
  deleteUser,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import {
  registerValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  updateProfileValidation,
} from '../validators/authValidator.js';

const router = express.Router();

router.post('/register', registerValidation, validate, register);
router.post('/login', loginValidation, validate, login);
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, upload.single('avatar'), updateProfileValidation, validate, updateProfile);
router.post('/forgot-password', forgotPasswordValidation, validate, forgotPassword);
router.put('/reset-password/:token', resetPasswordValidation, validate, resetPassword);
router.post('/refresh-token', refreshToken);
router.delete('/account', protect, deleteAccount);
router.post('/wishlist/:productId', protect, addToWishlist);

router.get('/users', protect, authorize('admin'), getAllUsers);
router.delete('/users/:id', protect, authorize('admin'), deleteUser);

export default router;
