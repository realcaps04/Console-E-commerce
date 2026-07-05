import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { orderAPI } from '../api/services';
import { formatPrice } from '../utils/helpers';
import Spinner from '../components/ui/Spinner';

const validationSchema = Yup.object({
  shippingAddress: Yup.object({
    fullName: Yup.string().required('Full name is required'),
    phone: Yup.string().required('Phone is required').matches(/^[+]?[\d\s-]{10,15}$/, 'Invalid phone'),
    street: Yup.string().required('Street address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    postalCode: Yup.string().required('Postal code is required'),
  }),
  paymentMethod: Yup.string().oneOf(['card', 'upi', 'cod', 'netbanking']).required('Select payment method'),
});

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { items, totals, discountAmount } = useSelector((state) => state.cart);
  const [loading, setLoading] = useState(false);
  const [sameAsBilling, setSameAsBilling] = useState(true);

  const formik = useFormik({
    initialValues: {
      shippingAddress: {
        fullName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
      },
      billingAddress: {
        fullName: '',
        phone: '',
        street: '',
        city: '',
        state: '',
        postalCode: '',
        country: 'India',
      },
      paymentMethod: 'cod',
      couponCode: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setLoading(true);
      try {
        const orderItems = items.map((item) => ({
          product: item.product?._id || item.productId,
          quantity: item.quantity,
        }));

        const { data } = await orderAPI.createOrder({
          orderItems,
          shippingAddress: values.shippingAddress,
          billingAddress: sameAsBilling ? values.shippingAddress : values.billingAddress,
          paymentMethod: values.paymentMethod,
          couponCode: values.couponCode || undefined,
        });

        toast.success('Order placed successfully!');
        navigate(`/orders/${data.order._id}`, { state: { isNewOrder: true } });
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to place order');
      } finally {
        setLoading(false);
      }
    },
  });

  const renderAddressFields = (prefix) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {['fullName', 'phone', 'street', 'city', 'state', 'postalCode'].map((field) => (
        <div key={field} className={field === 'street' ? 'md:col-span-2' : ''}>
          <label className="block text-sm font-medium mb-1 capitalize">
            {field.replace(/([A-Z])/g, ' $1')}
          </label>
          <input
            name={`${prefix}.${field}`}
            value={formik.values[prefix][field]}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className="input-field"
          />
          {formik.touched[prefix]?.[field] && formik.errors[prefix]?.[field] && (
            <p className="text-red-500 text-sm mt-1">{formik.errors[prefix][field]}</p>
          )}
        </div>
      ))}
    </div>
  );

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="section-container py-8 lg:py-12">
      <h1 className="text-3xl font-display font-bold mb-8">Checkout</h1>

      <form onSubmit={formik.handleSubmit}>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="glass-card p-6">
              <h2 className="font-display font-semibold text-lg mb-4">Shipping Address</h2>
              {renderAddressFields('shippingAddress')}
            </div>

            <div className="glass-card p-6">
              <label className="flex items-center gap-3 mb-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={sameAsBilling}
                  onChange={(e) => setSameAsBilling(e.target.checked)}
                  className="w-5 h-5 rounded text-primary-500"
                />
                <span>Billing address same as shipping</span>
              </label>
              {!sameAsBilling && (
                <>
                  <h2 className="font-display font-semibold text-lg mb-4">Billing Address</h2>
                  {renderAddressFields('billingAddress')}
                </>
              )}
            </div>

            <div className="glass-card p-6">
              <h2 className="font-display font-semibold text-lg mb-4">Payment Method</h2>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'cod', label: 'Cash on Delivery' },
                  { value: 'card', label: 'Credit/Debit Card' },
                  { value: 'upi', label: 'UPI' },
                  { value: 'netbanking', label: 'Net Banking' },
                ].map((method) => (
                  <label
                    key={method.value}
                    className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
                      formik.values.paymentMethod === method.value
                        ? 'border-primary-500 bg-primary-500/5'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.value}
                      checked={formik.values.paymentMethod === method.value}
                      onChange={formik.handleChange}
                      className="text-primary-500"
                    />
                    <span className="font-medium">{method.label}</span>
                  </label>
                ))}
              </div>
              {formik.values.paymentMethod !== 'cod' && (
                <p className="text-sm text-gray-500 mt-4">
                  Mock payment gateway — payment will be simulated as successful.
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="glass-card p-6 sticky top-24">
              <h2 className="font-display font-semibold text-lg mb-6">Order Summary</h2>
              <div className="space-y-3 text-sm mb-6">
                {items.map((item) => (
                  <div key={item._id || item.productId} className="flex justify-between">
                    <span className="text-gray-500 truncate mr-2">
                      {(item.product?.name || 'Product')} x {item.quantity}
                    </span>
                    <span>{formatPrice((item.product?.price || 0) * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 dark:border-gray-700 pt-3 space-y-2">
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
                  <div className="flex justify-between font-semibold text-lg pt-2">
                    <span>Total</span>
                    <span>{formatPrice(totals.totalPrice)}</span>
                  </div>
                </div>
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full">
                {loading ? <Spinner size="sm" /> : 'Place Order'}
              </button>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default CheckoutPage;
