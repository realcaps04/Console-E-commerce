import Product from '../models/Product.js';
import Order from '../models/Order.js';
import User from '../models/User.js';

const RAPIDMINER_API_URL = process.env.RAPIDMINER_API_URL;
const RAPIDMINER_API_KEY = process.env.RAPIDMINER_API_KEY;

const fetchRapidMinerRecommendations = async (userId, productId, limit = 8) => {
  if (!RAPIDMINER_API_URL || !RAPIDMINER_API_KEY) {
    return null;
  }

  try {
    const response = await fetch(`${RAPIDMINER_API_URL}/recommendations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${RAPIDMINER_API_KEY}`,
      },
      body: JSON.stringify({ userId, productId, limit }),
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) return null;

    const data = await response.json();
    if (data?.productIds?.length) {
      return Product.find({
        _id: { $in: data.productIds },
        isActive: true,
        stock: { $gt: 0 },
      }).populate('category brand');
    }
    return null;
  } catch {
    return null;
  }
};

const getCategorySimilarProducts = async (productId, limit = 8) => {
  const product = await Product.findById(productId);
  if (!product) return [];

  return Product.find({
    category: product.category,
    _id: { $ne: productId },
    isActive: true,
    stock: { $gt: 0 },
  })
    .sort({ soldCount: -1, ratings: -1 })
    .limit(limit)
    .populate('category brand');
};

const getPurchaseHistoryRecommendations = async (userId, limit = 8) => {
  const orders = await Order.find({
    user: userId,
    status: { $in: ['delivered', 'confirmed', 'shipped'] },
  }).select('orderItems');

  const purchasedProductIds = [
    ...new Set(
      orders.flatMap((order) =>
        order.orderItems.map((item) => item.product.toString())
      )
    ),
  ];

  if (!purchasedProductIds.length) return [];

  const purchasedProducts = await Product.find({
    _id: { $in: purchasedProductIds },
  }).select('category');

  const categories = [...new Set(purchasedProducts.map((p) => p.category.toString()))];

  return Product.find({
    category: { $in: categories },
    _id: { $nin: purchasedProductIds },
    isActive: true,
    stock: { $gt: 0 },
  })
    .sort({ soldCount: -1, ratings: -1 })
    .limit(limit)
    .populate('category brand');
};

const getTopSellingProducts = async (limit = 8) => {
  return Product.find({ isActive: true, stock: { $gt: 0 } })
    .sort({ soldCount: -1, ratings: -1 })
    .limit(limit)
    .populate('category brand');
};

const getTrendingProducts = async (limit = 8) => {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const trending = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: thirtyDaysAgo },
        status: { $nin: ['cancelled', 'returned'] },
      },
    },
    { $unwind: '$orderItems' },
    {
      $group: {
        _id: '$orderItems.product',
        totalSold: { $sum: '$orderItems.quantity' },
      },
    },
    { $sort: { totalSold: -1 } },
    { $limit: limit },
  ]);

  if (!trending.length) {
    return getTopSellingProducts(limit);
  }

  const productIds = trending.map((t) => t._id);
  const products = await Product.find({
    _id: { $in: productIds },
    isActive: true,
    stock: { $gt: 0 },
  }).populate('category brand');

  return productIds
    .map((id) => products.find((p) => p._id.toString() === id.toString()))
    .filter(Boolean);
};

const getCustomersAlsoBought = async (productId, limit = 8) => {
  const orders = await Order.find({
    'orderItems.product': productId,
    status: { $nin: ['cancelled', 'returned'] },
  }).select('orderItems');

  const coPurchasedIds = {};
  orders.forEach((order) => {
    order.orderItems.forEach((item) => {
      const id = item.product.toString();
      if (id !== productId.toString()) {
        coPurchasedIds[id] = (coPurchasedIds[id] || 0) + item.quantity;
      }
    });
  });

  const sortedIds = Object.entries(coPurchasedIds)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([id]) => id);

  if (!sortedIds.length) {
    return getCategorySimilarProducts(productId, limit);
  }

  return Product.find({
    _id: { $in: sortedIds },
    isActive: true,
    stock: { $gt: 0 },
  }).populate('category brand');
};

const getRecentlyViewedRecommendations = async (userId, limit = 8) => {
  const user = await User.findById(userId).select('recentlyViewed');
  if (!user?.recentlyViewed?.length) return [];

  const viewedIds = user.recentlyViewed
    .sort((a, b) => b.viewedAt - a.viewedAt)
    .slice(0, 5)
    .map((v) => v.product);

  const viewedProducts = await Product.find({ _id: { $in: viewedIds } }).select(
    'category'
  );
  const categories = [...new Set(viewedProducts.map((p) => p.category.toString()))];

  return Product.find({
    category: { $in: categories },
    _id: { $nin: viewedIds },
    isActive: true,
    stock: { $gt: 0 },
  })
    .sort({ ratings: -1, soldCount: -1 })
    .limit(limit)
    .populate('category brand');
};

export const getRecommendations = async ({
  userId = null,
  productId = null,
  type = 'homepage',
  limit = 8,
}) => {
  const rapidMinerResults = await fetchRapidMinerRecommendations(
    userId,
    productId,
    limit
  );
  if (rapidMinerResults?.length) {
    return {
      source: 'rapidminer',
      products: rapidMinerResults,
    };
  }

  let products = [];

  switch (type) {
    case 'product':
      products = await getCustomersAlsoBought(productId, limit);
      break;
    case 'cart':
      if (userId) {
        products = await getPurchaseHistoryRecommendations(userId, limit);
      }
      if (!products.length) {
        products = await getTopSellingProducts(limit);
      }
      break;
    case 'recently_viewed':
      if (userId) {
        products = await getRecentlyViewedRecommendations(userId, limit);
      }
      break;
    case 'trending':
      products = await getTrendingProducts(limit);
      break;
    case 'homepage':
    default:
      if (userId) {
        products = await getPurchaseHistoryRecommendations(userId, limit);
      }
      if (!products.length) {
        products = await getTrendingProducts(limit);
      }
      if (!products.length) {
        products = await getTopSellingProducts(limit);
      }
      break;
  }

  return {
    source: 'intelligent_fallback',
    products,
  };
};

export default {
  getRecommendations,
  getTopSellingProducts,
  getTrendingProducts,
  getCategorySimilarProducts,
  getCustomersAlsoBought,
};
