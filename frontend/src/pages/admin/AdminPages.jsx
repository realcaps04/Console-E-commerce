import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { productAPI, orderAPI } from '../../api/services';
import Spinner from '../../components/ui/Spinner';
import { formatPrice, formatDate, getOrderStatusColor } from '../../utils/helpers';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    productAPI.getProducts({ limit: 50 })
      .then(({ data }) => setProducts(data.products))
      .finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await productAPI.deleteProduct(id);
      setProducts((prev) => prev.filter((p) => p._id !== id));
      toast.success('Product deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-display font-bold">Products</h1>
        <span className="text-gray-500">{products.length} products</span>
      </div>
      <div className="glass-card overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="text-left p-4 text-sm font-medium">Product</th>
              <th className="text-left p-4 text-sm font-medium">SKU</th>
              <th className="text-left p-4 text-sm font-medium">Price</th>
              <th className="text-left p-4 text-sm font-medium">Stock</th>
              <th className="text-left p-4 text-sm font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((product) => (
              <tr key={product._id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <img src={product.images?.[0]?.url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <span className="font-medium text-sm">{product.name}</span>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-500">{product.sku}</td>
                <td className="p-4 text-sm">{formatPrice(product.price)}</td>
                <td className="p-4 text-sm">{product.stock}</td>
                <td className="p-4">
                  <button onClick={() => handleDelete(product._id)} className="text-red-500 text-sm hover:underline">
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export const AdminOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    orderAPI.getAllOrders({ limit: 50 })
      .then(({ data }) => setOrders(data.orders))
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id, status) => {
    try {
      const { data } = await orderAPI.updateOrderStatus(id, { status });
      setOrders((prev) => prev.map((o) => (o._id === id ? data.order : o)));
      toast.success('Status updated');
    } catch {
      toast.error('Update failed');
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Spinner size="lg" /></div>;

  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-8">Orders</h1>
      <div className="space-y-4">
        {orders.map((order) => (
          <div key={order._id} className="glass-card p-6">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
              <div>
                <p className="font-semibold">#{order.orderNumber}</p>
                <p className="text-sm text-gray-500">{order.user?.name} • {formatDate(order.createdAt)}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${getOrderStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="font-semibold">{formatPrice(order.totalPrice)}</p>
              <select
                value={order.status}
                onChange={(e) => updateStatus(order._id, e.target.value)}
                className="input-field w-auto text-sm py-2"
              >
                {['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'].map((s) => (
                  <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const AdminAnalytics = () => {
  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-8">Analytics</h1>
      <p className="text-gray-500">View detailed analytics on the main dashboard.</p>
    </div>
  );
};

export const AdminSettings = () => {
  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-8">Settings</h1>
      <div className="glass-card p-6 max-w-lg">
        <h2 className="font-semibold mb-4">Store Settings</h2>
        <p className="text-gray-500 text-sm">Configure store settings, payment gateways, and notifications from here.</p>
      </div>
    </div>
  );
};

export const AdminUsers = () => {
  return (
    <div>
      <h1 className="text-3xl font-display font-bold mb-8">Customers</h1>
      <p className="text-gray-500">Customer management available via API at GET /api/auth/users</p>
    </div>
  );
};
