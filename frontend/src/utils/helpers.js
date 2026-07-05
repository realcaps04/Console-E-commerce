export const formatPrice = (price) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(price);
};

export const calculateDiscount = (mrp, price) => {
  if (!mrp || mrp <= price) return 0;
  return Math.round(((mrp - price) / mrp) * 100);
};

export const getGuestCart = () => {
  try {
    const cart = localStorage.getItem('guestCart');
    return cart ? JSON.parse(cart) : [];
  } catch {
    return [];
  }
};

export const setGuestCart = (items) => {
  localStorage.setItem('guestCart', JSON.stringify(items));
};

export const clearGuestCart = () => {
  localStorage.removeItem('guestCart');
};

export const classNames = (...classes) => {
  return classes.filter(Boolean).join(' ');
};

export const truncate = (str, length = 100) => {
  if (!str) return '';
  return str.length > length ? `${str.substring(0, length)}...` : str;
};

export const getOrderStatusColor = (status) => {
  const colors = {
    pending: 'bg-amber-50 text-amber-800',
    confirmed: 'bg-blue-50 text-blue-800',
    processing: 'bg-indigo-50 text-indigo-800',
    shipped: 'bg-violet-50 text-violet-800',
    out_for_delivery: 'bg-orange-50 text-orange-800',
    delivered: 'bg-green-50 text-green-800',
    cancelled: 'bg-red-50 text-red-800',
    return_requested: 'bg-amber-50 text-amber-800',
    returned: 'bg-gray-100 text-gray-700',
  };
  return colors[status] || colors.pending;
};

export const formatDate = (date) => {
  return new Date(date).toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

export const SHIPPING_THRESHOLD = 999;
export const SHIPPING_COST = 99;

export const calculateCartTotals = (items, couponDiscount = 0) => {
  const itemsPrice = items.reduce(
    (acc, item) => acc + (item.product?.price || item.price) * item.quantity,
    0
  );

  const taxPrice = items.reduce((acc, item) => {
    const price = item.product?.price || item.price;
    const gst = item.product?.gst || item.gst || 18;
    return acc + (price * item.quantity * gst) / 100;
  }, 0);

  const shippingPrice = itemsPrice >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;
  const totalPrice = itemsPrice + taxPrice + shippingPrice - couponDiscount;

  return {
    itemsPrice: Math.round(itemsPrice * 100) / 100,
    taxPrice: Math.round(taxPrice * 100) / 100,
    shippingPrice,
    discountAmount: couponDiscount,
    totalPrice: Math.round(totalPrice * 100) / 100,
  };
};
