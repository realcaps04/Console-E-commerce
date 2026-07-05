import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiUsers, FiPackage, FiDollarSign, FiTrendingUp } from 'react-icons/fi';
import { analyticsAPI } from '../../api/services';
import Spinner from '../../components/ui/Spinner';
import { formatPrice, getOrderStatusColor } from '../../utils/helpers';

const StatCard = ({ icon: Icon, label, value, trend }) => (
  <div className="border border-border rounded-lg p-5 bg-white">
    <div className="flex items-center justify-between mb-3">
      <Icon className="w-4 h-4 text-muted" />
      {trend !== undefined && (
        <span className={`text-xs ${trend >= 0 ? 'text-green-700' : 'text-red-600'}`}>
          {trend >= 0 ? '+' : ''}{trend}%
        </span>
      )}
    </div>
    <p className="text-xl font-semibold text-ink">{value}</p>
    <p className="text-xs text-muted mt-0.5">{label}</p>
  </div>
);

const AdminDashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsAPI.getDashboard()
      .then(({ data }) => setDashboard(data.dashboard))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner size="lg" />
      </div>
    );
  }

  const { overview, recentOrders, lowStockProducts, topProducts, monthlySales } = dashboard || {};

  return (
    <div>
      <h1 className="page-title mb-8">Overview</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard icon={FiDollarSign} label="Total Revenue" value={formatPrice(overview?.totalRevenue || 0)} trend={overview?.revenueGrowth} />
        <StatCard icon={FiPackage} label="Total Orders" value={overview?.totalOrders || 0} />
        <StatCard icon={FiShoppingBag} label="Products" value={overview?.totalProducts || 0} />
        <StatCard icon={FiUsers} label="Customers" value={overview?.totalCustomers || 0} />
      </div>

      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <div className="glass-card p-6">
          <h2 className="font-semibold mb-4 flex items-center gap-2">
            <FiTrendingUp /> Monthly Sales
          </h2>
          {monthlySales?.length > 0 ? (
            <div className="space-y-3">
              {monthlySales.map((item) => (
                <div key={item.month} className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">{item.month}</span>
                  <div className="flex items-center gap-4">
                    <span className="text-sm">{item.orders} orders</span>
                    <span className="font-medium">{formatPrice(item.revenue)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No sales data yet</p>
          )}
        </div>

        <div className="glass-card p-6">
          <h2 className="font-semibold mb-4">Low Stock Alerts</h2>
          {lowStockProducts?.length > 0 ? (
            <div className="space-y-3">
              {lowStockProducts.map((product) => (
                <div key={product._id} className="flex items-center justify-between">
                  <span className="text-sm truncate mr-4">{product.name}</span>
                  <span className="text-red-500 text-sm font-medium">{product.stock} left</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">All products well stocked</p>
          )}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold">Recent Orders</h2>
            <Link to="/admin/orders" className="text-sm text-primary-500 hover:underline">View All</Link>
          </div>
          <div className="space-y-3">
            {recentOrders?.map((order) => (
              <div key={order._id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800 last:border-0">
                <div>
                  <p className="font-medium text-sm">#{order.orderNumber}</p>
                  <p className="text-xs text-gray-500">{order.user?.name}</p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-sm">{formatPrice(order.totalPrice)}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${getOrderStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6">
          <h2 className="font-semibold mb-4">Top Products</h2>
          <div className="space-y-3">
            {topProducts?.map((product, i) => (
              <div key={product._id} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-6 h-6 rounded-full bg-primary-500/10 text-primary-500 text-xs flex items-center justify-center font-medium">
                    {i + 1}
                  </span>
                  <span className="text-sm truncate">{product.name}</span>
                </div>
                <span className="text-sm text-gray-500">{product.totalSold} sold</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
