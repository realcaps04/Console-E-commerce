import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Category from '../models/Category.js';

export const getDashboardStats = async () => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

  const [
    totalOrders,
    totalProducts,
    totalCustomers,
    totalRevenue,
    monthlyRevenue,
    lastMonthRevenue,
    recentOrders,
    lowStockProducts,
    topProducts,
    ordersByStatus,
    monthlySales,
  ] = await Promise.all([
    Order.countDocuments(),
    Product.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'user' }),
    Order.aggregate([
      { $match: { status: { $nin: ['cancelled', 'returned'] } } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth },
          status: { $nin: ['cancelled', 'returned'] },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth },
          status: { $nin: ['cancelled', 'returned'] },
        },
      },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]),
    Order.find()
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .limit(10)
      .lean(),
    Product.find({
      isActive: true,
      stock: { $lte: 10, $gt: 0 },
    })
      .select('name sku stock lowStockThreshold images')
      .sort({ stock: 1 })
      .limit(10)
      .lean(),
    Order.aggregate([
      { $match: { status: { $nin: ['cancelled', 'returned'] } } },
      { $unwind: '$orderItems' },
      {
        $group: {
          _id: '$orderItems.product',
          name: { $first: '$orderItems.name' },
          totalSold: { $sum: '$orderItems.quantity' },
          revenue: { $sum: { $multiply: ['$orderItems.price', '$orderItems.quantity'] } },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
    ]),
    Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
          },
          status: { $nin: ['cancelled', 'returned'] },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          revenue: { $sum: '$totalPrice' },
          orders: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
  ]);

  const revenue = totalRevenue[0]?.total || 0;
  const currentMonthRevenue = monthlyRevenue[0]?.total || 0;
  const previousMonthRevenue = lastMonthRevenue[0]?.total || 0;
  const revenueGrowth =
    previousMonthRevenue > 0
      ? ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100
      : 0;

  return {
    overview: {
      totalOrders,
      totalProducts,
      totalCustomers,
      totalRevenue: revenue,
      monthlyRevenue: currentMonthRevenue,
      revenueGrowth: Math.round(revenueGrowth * 100) / 100,
    },
    recentOrders,
    lowStockProducts,
    topProducts,
    ordersByStatus: ordersByStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {}),
    monthlySales: monthlySales.map((item) => ({
      month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
      revenue: item.revenue,
      orders: item.orders,
    })),
  };
};

export default { getDashboardStats };
