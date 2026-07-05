import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { orderAPI } from '../api/services';
import Spinner from '../components/ui/Spinner';
import EmptyState from '../components/ui/EmptyState';
import { FiPackage } from 'react-icons/fi';
import { formatPrice, formatDate, getOrderStatusColor } from '../utils/helpers';

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getMyOrders()
      .then(({ data }) => setOrders(data.orders))
      .catch(() => toast.error('Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  const handleCancel = async (orderId) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await orderAPI.cancelOrder(orderId, 'Cancelled by customer');
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, status: 'cancelled' } : o))
      );
      toast.success('Order cancelled');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Cannot cancel order');
    }
  };

  if (loading) {
    return (
      <div className="section-container py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="section-container py-12">
        <EmptyState
          icon={FiPackage}
          title="No orders yet"
          description="When you place orders, they'll appear here"
          actionLabel="Start Shopping"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="section-container py-8 lg:py-12">
      <h1 className="text-3xl font-display font-bold mb-8">My Orders</h1>

      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="glass-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <p className="font-semibold">#{order.orderNumber}</p>
                <p className="text-sm text-gray-500">{formatDate(order.createdAt)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getOrderStatusColor(order.status)}`}>
                {order.status.replace(/_/g, ' ')}
              </span>
            </div>

            <div className="flex flex-wrap gap-4 mb-4">
              {order.orderItems?.slice(0, 3).map((item) => (
                <div key={item._id} className="flex items-center gap-3">
                  <img src={item.image} alt={item.name} className="w-12 h-12 rounded-lg object-cover" />
                  <div>
                    <p className="text-sm font-medium line-clamp-1">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                </div>
              ))}
              {order.orderItems?.length > 3 && (
                <span className="text-sm text-gray-500 self-center">
                  +{order.orderItems.length - 3} more
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <p className="font-semibold">{formatPrice(order.totalPrice)}</p>
              <div className="flex gap-3">
                <Link to={`/orders/${order._id}`} className="btn-secondary text-sm py-2">
                  View Details
                </Link>
                {['pending', 'confirmed'].includes(order.status) && (
                  <button
                    onClick={() => handleCancel(order._id)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersPage;
