import express from 'express';
import {
  getProductRecommendations,
  getDashboard,
} from '../controllers/analyticsController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/recommendations', optionalAuth, getProductRecommendations);
router.get('/dashboard', protect, authorize('admin'), getDashboard);

export default router;
