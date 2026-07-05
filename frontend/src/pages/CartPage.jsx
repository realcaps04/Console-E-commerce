import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiMinus, FiPlus, FiTrash2, FiShoppingBag } from 'react-icons/fi';
import {
  fetchCart,
  updateCartItem,
  removeFromCart,
  applyCoupon,
  clearCart,
} from '../redux/slices/cartSlice';
import EmptyState from '../components/ui/EmptyState';
import Spinner from '../components/ui/Spinner';
import ProductCard from '../components/products/ProductCard';
import { analyticsAPI } from '../api/services';
import { formatPrice } from '../utils/helpers';

const CartPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { items, totals, loading, isGuest, discountAmount } = useSelector((state) => state.cart);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [couponCode, setCouponCode] = useState('');
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    dispatch(fetchCart());
  }, [dispatch, isAuthenticated]);

  useEffect(() => {
    analyticsAPI.getRecommendations({ type: 'cart', limit: 4 })
      .then(({ data }) => setRecommendations(data.products))
      .catch(() => {});
  }, []);

  const getItemData = (item) => {
    if (isGuest) {
      return {
        id: item.productId,
        productId: item.productId,
        product: item.product,
        quantity: item.quantity,
        price: item.product?.price,
        name: item.product?.name,
        image: item.product?.images?.[0]?.url,
      };
    }
    return {
      id: item._id,
      productId: item.product?._id,
      product: item.product,
      quantity: item.quantity,
      price: item.product?.price,
      name: item.product?.name,
      image: item.product?.images?.[0]?.url,
    };
  };

  const handleQuantityChange = (item, newQty) => {
    dispatch(updateCartItem({
      itemId: item.id,
      quantity: newQty,
      productId: item.productId,
    }));
  };

  const handleRemove = (item) => {
    dispatch(removeFromCart({ itemId: item.id, productId: item.productId }));
    toast.success('Item removed');
  };

  const handleApplyCoupon = () => {
    if (!isAuthenticated) {
      toast.error('Please login to apply coupon');
      return;
    }
    dispatch(applyCoupon(couponCode))
      .unwrap()
      .then(() => toast.success('Coupon applied!'))
      .catch((err) => toast.error(err));
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.error('Please login to checkout');
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  };

  if (loading) {
    return (
      <div className="section-container py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const cartItems = items.map(getItemData);

  if (cartItems.length === 0) {
    return (
      <div className="section-container py-12">
        <EmptyState
          icon={FiShoppingBag}
          title="Your cart is empty"
          description="Looks like you haven't added anything to your cart yet"
          actionLabel="Start Shopping"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="section-container py-8 lg:py-12">
      <h1 className="page-title mb-8">Shopping cart</h1>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {cartItems.map((item) => (
            <div key={item.id || item.productId} className="glass-card p-4 flex gap-4">
              <Link to={`/products/${item.productId}`} className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                <img src={item.image || 'https://via.placeholder.com/100'} alt={item.name} className="w-full h-full object-cover" />
              </Link>
              <div className="flex-1">
                <Link to={`/products/${item.productId}`} className="font-medium hover:text-primary-500">
                  {item.name}
                </Link>
                <p className="text-primary-500 font-semibold mt-1">{formatPrice(item.price)}</p>
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-lg">
                    <button onClick={() => handleQuantityChange(item, item.quantity - 1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <FiMinus className="w-4 h-4" />
                    </button>
                    <span className="px-4">{item.quantity}</span>
                    <button onClick={() => handleQuantityChange(item, item.quantity + 1)} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800">
                      <FiPlus className="w-4 h-4" />
                    </button>
                  </div>
                  <button onClick={() => handleRemove(item)} className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
                    <FiTrash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
              <div className="text-right font-semibold">
                {formatPrice(item.price * item.quantity)}
              </div>
            </div>
          ))}

          <button onClick={() => dispatch(clearCart())} className="text-red-500 text-sm hover:underline">
            Clear Cart
          </button>
        </div>

        <div className="lg:col-span-1">
          <div className="glass-card p-6 sticky top-24">
            <h2 className="font-display font-semibold text-lg mb-6">Order Summary</h2>

            <div className="space-y-3 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-gray-500">Subtotal</span>
                <span>{formatPrice(totals.itemsPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">GST</span>
                <span>{formatPrice(totals.taxPrice)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Shipping</span>
                <span>{totals.shippingPrice === 0 ? 'FREE' : formatPrice(totals.shippingPrice)}</span>
              </div>
              {discountAmount > 0 && (
                <div className="flex justify-between text-green-600">
                  <span>Discount</span>
                  <span>-{formatPrice(discountAmount)}</span>
                </div>
              )}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-3 flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatPrice(totals.totalPrice)}</span>
              </div>
            </div>

            {isAuthenticated && (
              <div className="flex gap-2 mb-6">
                <input
                  type="text"
                  placeholder="Coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="input-field flex-1 text-sm"
                />
                <button onClick={handleApplyCoupon} className="btn-secondary text-sm px-4">
                  Apply
                </button>
              </div>
            )}

            <button onClick={handleCheckout} className="btn-primary w-full">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>

      {recommendations.length > 0 && (
        <section className="mt-16">
          <h2 className="text-2xl font-display font-bold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendations.map((p, i) => (
              <ProductCard key={p._id} product={p} index={i} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default CartPage;
