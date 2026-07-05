import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import Cart from '../models/Cart.js';
import { AppError, asyncHandler } from '../utils/apiResponse.js';

const SHIPPING_THRESHOLD = 999;
const SHIPPING_COST = 99;
const GST_RATE = 0.18;

const calculateOrderPrices = (orderItems, coupon = null) => {
  const itemsPrice = orderItems.reduce(
    (acc, item) => acc + item.price * item.quantity,
    0
  );

  const taxPrice = orderItems.reduce(
    (acc, item) => acc + (item.price * item.quantity * (item.gst || 18)) / 100,
    0
  );

  const shippingPrice = itemsPrice >= SHIPPING_THRESHOLD ? 0 : SHIPPING_COST;

  let discountAmount = 0;
  if (coupon) {
    discountAmount = coupon.calculateDiscount(itemsPrice);
  }

  const totalPrice = itemsPrice + taxPrice + shippingPrice - discountAmount;

  return {
    itemsPrice: Math.round(itemsPrice * 100) / 100,
    taxPrice: Math.round(taxPrice * 100) / 100,
    shippingPrice,
    discountAmount: Math.round(discountAmount * 100) / 100,
    totalPrice: Math.round(totalPrice * 100) / 100,
  };
};

export const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, billingAddress, paymentMethod, couponCode } =
    req.body;

  if (!orderItems?.length) {
    throw new AppError('No order items', 400);
  }

  const processedItems = [];

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product || !product.isActive) {
      throw new AppError(`Product not found: ${item.product}`, 404);
    }
    if (product.stock < item.quantity) {
      throw new AppError(`Insufficient stock for ${product.name}`, 400);
    }

    processedItems.push({
      product: product._id,
      name: product.name,
      image: product.images[0]?.url || '',
      sku: product.sku,
      price: product.price,
      mrp: product.mrp,
      quantity: item.quantity,
      gst: product.gst,
    });
  }

  let coupon = null;
  if (couponCode) {
    coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    if (!coupon) {
      throw new AppError('Invalid coupon code', 400);
    }
  }

  const prices = calculateOrderPrices(processedItems, coupon);

  if (coupon && prices.discountAmount === 0) {
    throw new AppError('Coupon is not valid for this order', 400);
  }

  const order = await Order.create({
    user: req.user._id,
    orderItems: processedItems,
    shippingAddress,
    billingAddress: billingAddress || shippingAddress,
    paymentMethod,
    couponCode: coupon?.code,
    ...prices,
    statusHistory: [{ status: 'pending', note: 'Order placed' }],
    paymentResult:
      paymentMethod === 'cod'
        ? { status: 'pending', updateTime: new Date().toISOString() }
        : {
            id: `PAY_${Date.now()}`,
            status: 'completed',
            updateTime: new Date().toISOString(),
            email: req.user.email,
          },
    isPaid: paymentMethod !== 'cod',
    paidAt: paymentMethod !== 'cod' ? new Date() : undefined,
    status: paymentMethod === 'cod' ? 'pending' : 'confirmed',
  });

  for (const item of processedItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: -item.quantity, soldCount: item.quantity },
    });
  }

  if (coupon) {
    coupon.usedCount += 1;
    await coupon.save();
  }

  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $set: { items: [], coupon: null } }
  );

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    order,
  });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const [orders, total] = await Promise.all([
    Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments({ user: req.user._id }),
  ]);

  res.status(200).json({
    success: true,
    orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('user', 'name email phone')
    .populate('orderItems.product', 'name images slug')
    .lean();

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (req.user.role !== 'admin' && order.user._id.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  res.status(200).json({ success: true, order });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;
  const skip = (page - 1) * limit;

  const query = {};
  if (req.query.status) query.status = req.query.status;

  const [orders, total] = await Promise.all([
    Order.find(query)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Order.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    orders,
    pagination: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, trackingNumber, estimatedDelivery } = req.body;

  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  order.status = status;
  order.statusHistory.push({ status, note: note || `Status updated to ${status}` });

  if (trackingNumber) order.trackingNumber = trackingNumber;
  if (estimatedDelivery) order.estimatedDelivery = estimatedDelivery;

  if (status === 'delivered') {
    order.isDelivered = true;
    order.deliveredAt = new Date();
  }

  await order.save();

  res.status(200).json({
    success: true,
    message: 'Order updated',
    order,
  });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
    throw new AppError('Not authorized', 403);
  }

  if (!['pending', 'confirmed'].includes(order.status)) {
    throw new AppError('Order cannot be cancelled at this stage', 400);
  }

  order.status = 'cancelled';
  order.cancelReason = req.body.reason || 'Cancelled by user';
  order.statusHistory.push({
    status: 'cancelled',
    note: order.cancelReason,
  });

  for (const item of order.orderItems) {
    await Product.findByIdAndUpdate(item.product, {
      $inc: { stock: item.quantity, soldCount: -item.quantity },
    });
  }

  await order.save();

  res.status(200).json({ success: true, message: 'Order cancelled', order });
});

export const requestReturn = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    throw new AppError('Order not found', 404);
  }

  if (order.user.toString() !== req.user._id.toString()) {
    throw new AppError('Not authorized', 403);
  }

  if (order.status !== 'delivered') {
    throw new AppError('Return can only be requested for delivered orders', 400);
  }

  order.status = 'return_requested';
  order.returnReason = req.body.reason || 'Return requested';
  order.statusHistory.push({
    status: 'return_requested',
    note: order.returnReason,
  });

  await order.save();

  res.status(200).json({ success: true, message: 'Return requested', order });
});

export const deleteOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    throw new AppError('Order not found', 404);
  }

  await order.deleteOne();
  res.status(200).json({ success: true, message: 'Order deleted' });
});

export const validateCoupon = asyncHandler(async (req, res) => {
  const { code, orderAmount } = req.body;

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) {
    throw new AppError('Invalid coupon code', 404);
  }

  const discount = coupon.calculateDiscount(parseFloat(orderAmount));

  if (discount === 0) {
    throw new AppError('Coupon is not valid for this order', 400);
  }

  res.status(200).json({
    success: true,
    coupon: {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.discountValue,
      discountAmount: discount,
    },
  });
});
