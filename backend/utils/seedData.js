import dotenv from 'dotenv';
import User from '../models/User.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import connectDB from '../config/db.js';

dotenv.config();

const categories = [
  { name: 'Electronics', description: 'Latest gadgets and devices' },
  { name: 'Fashion', description: 'Premium clothing and accessories' },
  { name: 'Home & Living', description: 'Elegant home essentials' },
  { name: 'Sports', description: 'Fitness and outdoor gear' },
  { name: 'Books', description: 'Knowledge and entertainment' },
];

const brands = [
  { name: 'Apple', description: 'Think Different' },
  { name: 'Samsung', description: 'Innovation for everyone' },
  { name: 'Nike', description: 'Just Do It' },
  { name: 'Sony', description: 'Be Moved' },
  { name: 'Console', description: 'Premium curated products' },
];

const products = [
  {
    name: 'iPhone 15 Pro Max',
    description: 'The most powerful iPhone ever with A17 Pro chip, titanium design, and advanced camera system.',
    sku: 'CE-IP15PM-256',
    mrp: 159900,
    price: 144900,
    stock: 50,
    gst: 18,
    isFeatured: true,
    tags: ['smartphone', 'apple', 'premium'],
    images: [{ url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800' }],
  },
  {
    name: 'MacBook Pro 14" M3',
    description: 'Supercharged by M3 chip. Stunning Liquid Retina XDR display. Up to 22 hours battery life.',
    sku: 'CE-MBP14-M3',
    mrp: 199900,
    price: 189900,
    stock: 30,
    gst: 18,
    isFeatured: true,
    tags: ['laptop', 'apple', 'professional'],
    images: [{ url: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800' }],
  },
  {
    name: 'AirPods Pro 2',
    description: 'Active Noise Cancellation, Adaptive Transparency, and personalized Spatial Audio.',
    sku: 'CE-APP2-WHT',
    mrp: 24900,
    price: 21900,
    stock: 100,
    gst: 18,
    isFeatured: true,
    tags: ['audio', 'apple', 'wireless'],
    images: [{ url: 'https://images.unsplash.com/photo-1606220945770-b5b6c2c55bf1?w=800' }],
  },
  {
    name: 'Samsung Galaxy S24 Ultra',
    description: 'Galaxy AI is here. Epic titanium design with built-in S Pen and 200MP camera.',
    sku: 'CE-SGS24U-512',
    mrp: 134999,
    price: 119999,
    stock: 45,
    gst: 18,
    isFeatured: true,
    tags: ['smartphone', 'samsung', 'android'],
    images: [{ url: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800' }],
  },
  {
    name: 'Sony WH-1000XM5',
    description: 'Industry-leading noise cancellation with exceptional sound quality and comfort.',
    sku: 'CE-SNY-XM5-BLK',
    mrp: 29990,
    price: 24990,
    stock: 60,
    gst: 18,
    tags: ['headphones', 'sony', 'noise-cancelling'],
    images: [{ url: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=800' }],
  },
  {
    name: 'Nike Air Max 270',
    description: 'Nike\'s biggest heel Air unit yet delivers unrivaled, all-day comfort.',
    sku: 'CE-NKE-AM270',
    mrp: 12995,
    price: 9995,
    stock: 80,
    gst: 12,
    tags: ['shoes', 'nike', 'sports'],
    images: [{ url: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800' }],
  },
  {
    name: 'Console Premium Watch',
    description: 'Luxury smartwatch with health tracking, sapphire crystal, and 7-day battery.',
    sku: 'CE-CON-WATCH01',
    mrp: 45999,
    price: 39999,
    stock: 25,
    gst: 18,
    isFeatured: true,
    tags: ['watch', 'smartwatch', 'luxury'],
    images: [{ url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800' }],
  },
  {
    name: 'Minimal Desk Lamp',
    description: 'Premium aluminum desk lamp with wireless charging base and adjustable brightness.',
    sku: 'CE-HOM-LAMP01',
    mrp: 8999,
    price: 6999,
    stock: 40,
    gst: 18,
    tags: ['home', 'lighting', 'minimal'],
    images: [{ url: 'https://images.unsplash.com/photo-1507473885765-e6ed923f774e?w=800' }],
  },
];

const seedDatabase = async () => {
  try {
    await connectDB();

    await Promise.all([
      User.deleteMany(),
      Category.deleteMany(),
      Brand.deleteMany(),
      Product.deleteMany(),
      Coupon.deleteMany(),
    ]);

    await User.create([
      {
        name: 'Admin Console',
        email: 'admin@console.com',
        password: 'Admin@123',
        role: 'admin',
        phone: '+91 9876543210',
      },
      {
        name: 'Demo User',
        email: 'user@console.com',
        password: 'User@123',
        role: 'user',
        phone: '+91 9876543211',
      },
    ]);

    const createdCategories = await Category.insertMany(categories);
    const createdBrands = await Brand.insertMany(brands);

    const productsWithRefs = products.map((product, index) => ({
      ...product,
      category: createdCategories[index % createdCategories.length]._id,
      brand: createdBrands[index % createdBrands.length]._id,
      ratings: 4 + Math.random(),
      numReviews: Math.floor(Math.random() * 50) + 5,
      soldCount: Math.floor(Math.random() * 200) + 10,
    }));

    await Product.insertMany(productsWithRefs);

    await Coupon.create({
      code: 'CONSOLE10',
      description: '10% off on orders above ₹1000',
      discountType: 'percentage',
      discountValue: 10,
      minOrderAmount: 1000,
      maxDiscount: 5000,
      usageLimit: 1000,
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    await Coupon.create({
      code: 'FLAT500',
      description: 'Flat ₹500 off on orders above ₹5000',
      discountType: 'fixed',
      discountValue: 500,
      minOrderAmount: 5000,
      usageLimit: 500,
      validUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
    });

    console.log('Database seeded successfully!');
    console.log('Admin: admin@console.com / Admin@123');
    console.log('User: user@console.com / User@123');

    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDatabase();
