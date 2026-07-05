import { asyncHandler } from '../utils/apiResponse.js';
import { getRecommendations } from '../services/recommendationService.js';
import { getDashboardStats } from '../services/analyticsService.js';

export const getProductRecommendations = asyncHandler(async (req, res) => {
  const { type = 'homepage', productId, limit = 8 } = req.query;

  const result = await getRecommendations({
    userId: req.user?._id,
    productId,
    type,
    limit: parseInt(limit, 10),
  });

  res.status(200).json({
    success: true,
    source: result.source,
    products: result.products,
  });
});

export const getDashboard = asyncHandler(async (req, res) => {
  const stats = await getDashboardStats();

  res.status(200).json({
    success: true,
    dashboard: stats,
  });
});
