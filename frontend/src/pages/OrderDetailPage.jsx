import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { FiCheck } from 'react-icons/fi';
import { orderAPI } from '../api/services';
import Spinner from '../components/ui/Spinner';
import { formatPrice, formatDate, getOrderStatusColor } from '../utils/helpers';

const OrderDetailPage = () => {
  const { id } = useParams();
  const location = useLocation();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getOrder(id)
      .then(({ data }) => setOrder(data.order))
      .catch(() => toast.error('Order not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="section-container py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="section-container py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Order not found</h2>
        <Link to="/orders" className="btn-primary">Back to Orders</Link>
      </div>
    );
  }

  return (
    <div className="section-container py-8 lg:py-12">
      {location.state?.isNewOrder && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card p-8 text-center mb-8 bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
        >
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <FiCheck className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-display font-bold mb-2">Order Confirmed!</h2>
          <p className="text-gray-500">Thank you for shopping with Console Ecommerce</p>
        </motion.div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold">Order #{order.orderNumber}</h1>
          <p className="text-gray-500">Placed on {formatDate(order.createdAt)}</p>
        </div>
        <span className={`px-4 py-2 rounded-full text-sm font-medium capitalize ${getOrderStatusColor(order.status)}`}>
          {order.status.replace(/_/g, ' ')}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <h2 className="font-semibold mb-4">Order Items</h2>
            <div className="space-y-4">
              {order.orderItems.map((item) => (
                <div key={item._id} className="flex gap-4">
                  <img src={item.image} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
                  <div className="flex-1">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-gray-500">SKU: {item.sku}</p>
                    <p className="text-sm">Qty: {item.quantity} × {formatPrice(item.price)}</p>
                  </div>
                  <p className="font-semibold">{formatPrice(item.price * item.quantity)}</p>
                </div>
              ))}
            </div>
          </div>

          {order.statusHistory?.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="font-semibold mb-4">Order Timeline</h2>
              <div className="space-y-4">
                {order.statusHistory.map((entry, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="w-3 h-3 rounded-full bg-primary-500 mt-1.5" />
                    <div>
                      <p className="font-medium capitalize">{entry.status.replace(/_/g, ' ')}</p>
                      <p className="text-sm text-gray-500">{entry.note}</p>
                      <p className="text-xs text-gray-400">{formatDate(entry.updatedAt)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div className="glass-card p-6">
            <h2 className="font-semibold mb-4">Shipping Address</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {order.shippingAddress.fullName}<br />
              {order.shippingAddress.street}<br />
              {order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.postalCode}<br />
              {order.shippingAddress.phone}
            </p>
          </div>

          <div className="glass-card p-6">
            <h2 className="font-semibold mb-4">Payment Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(order.itemsPrice)}</span></div>
              <div className="flex justify-between"><span>GST</span><span>{formatPrice(order.taxPrice)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{order.shippingPrice === 0 ? 'FREE' : formatPrice(order.shippingPrice)}</span></div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-600"><span>Discount</span><span>-{formatPrice(order.discountAmount)}</span></div>
              )}
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-gray-200 dark:border-gray-700">
                <span>Total</span><span>{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 mt-4 capitalize">Payment: {order.paymentMethod.replace(/_/g, ' ')}</p>
            {order.invoiceNumber && (
              <p className="text-sm text-gray-500 mt-1">Invoice: {order.invoiceNumber}</p>
            )}
          </div>

          <Link to="/orders" className="btn-secondary w-full text-center block">
            Back to Orders
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;
