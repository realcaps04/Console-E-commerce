import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrder,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  requestReturn,
  deleteOrder,
  validateCoupon,
} from '../controllers/orderController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { orderValidation } from '../validators/authValidator.js';

const router = express.Router();

router.post('/validate-coupon', protect, validateCoupon);
router.post('/', protect, orderValidation, validate, createOrder);
router.get('/my', protect, getMyOrders);
router.get('/:id', protect, getOrder);
router.put('/:id/cancel', protect, cancelOrder);
router.put('/:id/return', protect, requestReturn);

router.get('/', protect, authorize('admin'), getAllOrders);
router.put('/:id', protect, authorize('admin'), updateOrderStatus);
router.delete('/:id', protect, authorize('admin'), deleteOrder);

export default router;
