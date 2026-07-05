import Cart from '../models/Cart.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import { AppError, asyncHandler } from '../utils/apiResponse.js';

const populateCart = (query) =>
  query.populate({
    path: 'items.product',
    select: 'name price mrp images stock slug gst discount ratings',
  }).populate('coupon');

export const getCart = asyncHandler(async (req, res) => {
  let cart = await populateCart(Cart.findOne({ user: req.user._id }));

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  res.status(200).json({ success: true, cart });
});

export const addToCart = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;

  const product = await Product.findById(productId);
  if (!product || !product.isActive) {
    throw new AppError('Product not found', 404);
  }

  if (product.stock < quantity) {
    throw new AppError('Insufficient stock', 400);
  }

  let cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  const existingItem = cart.items.find(
    (item) => item.product.toString() === productId
  );

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (product.stock < newQty) {
      throw new AppError('Insufficient stock', 400);
    }
    existingItem.quantity = newQty;
  } else {
    cart.items.push({ product: productId, quantity });
  }

  await cart.save();
  cart = await populateCart(Cart.findById(cart._id));

  res.status(200).json({ success: true, message: 'Added to cart', cart });
});

export const updateCartItem = asyncHandler(async (req, res) => {
  const { quantity } = req.body;
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  const item = cart.items.id(req.params.itemId);
  if (!item) {
    throw new AppError('Cart item not found', 404);
  }

  const product = await Product.findById(item.product);
  if (quantity > product.stock) {
    throw new AppError('Insufficient stock', 400);
  }

  if (quantity <= 0) {
    item.deleteOne();
  } else {
    item.quantity = quantity;
  }

  await cart.save();
  const updatedCart = await populateCart(Cart.findById(cart._id));

  res.status(200).json({ success: true, cart: updatedCart });
});

export const removeFromCart = asyncHandler(async (req, res) => {
  const cart = await Cart.findOne({ user: req.user._id });

  if (!cart) {
    throw new AppError('Cart not found', 404);
  }

  cart.items = cart.items.filter(
    (item) => item._id.toString() !== req.params.itemId
  );

  await cart.save();
  const updatedCart = await populateCart(Cart.findById(cart._id));

  res.status(200).json({ success: true, cart: updatedCart });
});

export const clearCart = asyncHandler(async (req, res) => {
  await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $set: { items: [], coupon: null } }
  );

  res.status(200).json({ success: true, message: 'Cart cleared' });
});

export const applyCoupon = asyncHandler(async (req, res) => {
  const { code } = req.body;
  const cart = await Cart.findOne({ user: req.user._id }).populate('items.product');

  if (!cart || !cart.items.length) {
    throw new AppError('Cart is empty', 400);
  }

  const coupon = await Coupon.findOne({ code: code.toUpperCase() });
  if (!coupon) {
    throw new AppError('Invalid coupon code', 404);
  }

  const itemsPrice = cart.items.reduce(
    (acc, item) => acc + item.product.price * item.quantity,
    0
  );

  const discount = coupon.calculateDiscount(itemsPrice);
  if (discount === 0) {
    throw new AppError('Coupon is not valid for this cart', 400);
  }

  cart.coupon = coupon._id;
  await cart.save();

  const updatedCart = await populateCart(Cart.findById(cart._id));

  res.status(200).json({
    success: true,
    message: 'Coupon applied',
    discountAmount: discount,
    cart: updatedCart,
  });
});

export const removeCoupon = asyncHandler(async (req, res) => {
  const cart = await Cart.findOneAndUpdate(
    { user: req.user._id },
    { $unset: { coupon: 1 } },
    { new: true }
  );

  const updatedCart = await populateCart(Cart.findById(cart._id));

  res.status(200).json({ success: true, cart: updatedCart });
});

export const syncGuestCart = asyncHandler(async (req, res) => {
  const { items } = req.body;

  if (!items?.length) {
    return res.status(200).json({ success: true, message: 'Nothing to sync' });
  }

  let cart = await Cart.findOne({ user: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user: req.user._id, items: [] });
  }

  for (const guestItem of items) {
    const product = await Product.findById(guestItem.productId);
    if (!product || !product.isActive) continue;

    const existing = cart.items.find(
      (item) => item.product.toString() === guestItem.productId
    );

    if (existing) {
      existing.quantity = Math.min(
        existing.quantity + guestItem.quantity,
        product.stock
      );
    } else {
      cart.items.push({
        product: guestItem.productId,
        quantity: Math.min(guestItem.quantity, product.stock),
      });
    }
  }

  await cart.save();
  const updatedCart = await populateCart(Cart.findById(cart._id));

  res.status(200).json({ success: true, cart: updatedCart });
});
