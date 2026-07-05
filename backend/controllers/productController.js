import Product from '../models/Product.js';
import Category from '../models/Category.js';
import Brand from '../models/Brand.js';
import User from '../models/User.js';
import { AppError, asyncHandler } from '../utils/apiResponse.js';
import {
  uploadToCloudinary,
  deleteFromCloudinary,
} from '../utils/cloudinaryUpload.js';

const buildProductQuery = (queryParams) => {
  const {
    search,
    category,
    brand,
    minPrice,
    maxPrice,
    minRating,
    inStock,
    isFeatured,
    sort,
  } = queryParams;

  const query = { isActive: true };

  if (search) {
    query.$text = { $search: search };
  }

  if (category) {
    query.category = category;
  }

  if (brand) {
    query.brand = brand;
  }

  if (minPrice || maxPrice) {
    query.price = {};
    if (minPrice) query.price.$gte = parseFloat(minPrice);
    if (maxPrice) query.price.$lte = parseFloat(maxPrice);
  }

  if (minRating) {
    query.ratings = { $gte: parseFloat(minRating) };
  }

  if (inStock === 'true') {
    query.stock = { $gt: 0 };
  }

  if (isFeatured === 'true') {
    query.isFeatured = true;
  }

  let sortOption = { createdAt: -1 };
  switch (sort) {
    case 'price_asc':
      sortOption = { price: 1 };
      break;
    case 'price_desc':
      sortOption = { price: -1 };
      break;
    case 'rating':
      sortOption = { ratings: -1 };
      break;
    case 'newest':
      sortOption = { createdAt: -1 };
      break;
    case 'popular':
      sortOption = { soldCount: -1 };
      break;
    case 'name_asc':
      sortOption = { name: 1 };
      break;
    case 'name_desc':
      sortOption = { name: -1 };
      break;
    case 'discount':
      sortOption = { discount: -1 };
      break;
    default:
      if (search) {
        sortOption = { score: { $meta: 'textScore' } };
      }
  }

  return { query, sortOption };
};

export const getProducts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 12;
  const skip = (page - 1) * limit;

  const { query, sortOption } = buildProductQuery(req.query);

  const [products, total] = await Promise.all([
    Product.find(query)
      .populate('category', 'name slug')
      .populate('brand', 'name slug')
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .lean(),
    Product.countDocuments(query),
  ]);

  res.status(200).json({
    success: true,
    products,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
    },
  });
});

export const getProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate('category', 'name slug')
    .populate('brand', 'name slug logo')
    .populate('reviews.user', 'name avatar')
    .lean();

  if (!product || !product.isActive) {
    throw new AppError('Product not found', 404);
  }

  if (req.user) {
    await User.findByIdAndUpdate(req.user._id, {
      $pull: { recentlyViewed: { product: product._id } },
    });
    await User.findByIdAndUpdate(req.user._id, {
      $push: {
        recentlyViewed: {
          $each: [{ product: product._id, viewedAt: new Date() }],
          $position: 0,
          $slice: 20,
        },
      },
    });
  }

  res.status(200).json({ success: true, product });
});

export const getProductBySlug = asyncHandler(async (req, res) => {
  const product = await Product.findOne({ slug: req.params.slug, isActive: true })
    .populate('category', 'name slug')
    .populate('brand', 'name slug logo')
    .populate('reviews.user', 'name avatar')
    .lean();

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  res.status(200).json({ success: true, product });
});

export const createProduct = asyncHandler(async (req, res) => {
  const productData = { ...req.body, createdBy: req.user._id };

  if (req.files?.length) {
    productData.images = [];
    for (const file of req.files) {
      const uploaded = await uploadToCloudinary(file.path, 'console-ecommerce/products');
      productData.images.push(uploaded);
    }
  }

  const product = await Product.create(productData);

  await Category.findByIdAndUpdate(product.category, { $inc: { productCount: 1 } });
  if (product.brand) {
    await Brand.findByIdAndUpdate(product.brand, { $inc: { productCount: 1 } });
  }

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    product,
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  let product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const updateData = { ...req.body };

  if (req.files?.length) {
    updateData.images = product.images || [];
    for (const file of req.files) {
      const uploaded = await uploadToCloudinary(file.path, 'console-ecommerce/products');
      updateData.images.push(uploaded);
    }
  }

  product = await Product.findByIdAndUpdate(req.params.id, updateData, {
    new: true,
    runValidators: true,
  }).populate('category brand');

  res.status(200).json({
    success: true,
    message: 'Product updated successfully',
    product,
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  if (product.images?.length) {
    for (const image of product.images) {
      await deleteFromCloudinary(image.public_id);
    }
  }

  product.isActive = false;
  await product.save();

  res.status(200).json({ success: true, message: 'Product deleted successfully' });
});

export const createReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const product = await Product.findById(req.params.id);

  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const alreadyReviewed = product.reviews.find(
    (r) => r.user.toString() === req.user._id.toString()
  );

  if (alreadyReviewed) {
    throw new AppError('Product already reviewed', 400);
  }

  const review = {
    user: req.user._id,
    name: req.user.name,
    rating: Number(rating),
    comment,
  };

  product.reviews.push(review);
  product.numReviews = product.reviews.length;
  product.ratings =
    product.reviews.reduce((acc, item) => item.rating + acc, 0) / product.reviews.length;

  await product.save();

  res.status(201).json({ success: true, message: 'Review added', product });
});

export const searchProducts = asyncHandler(async (req, res) => {
  req.query.search = req.query.q || req.query.search;
  return getProducts(req, res);
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find({ isActive: true }).sort({ name: 1 }).lean();
  res.status(200).json({ success: true, categories });
});

export const createCategory = asyncHandler(async (req, res) => {
  const categoryData = { ...req.body };

  if (req.file) {
    const uploaded = await uploadToCloudinary(req.file.path, 'console-ecommerce/categories');
    categoryData.image = uploaded;
  }

  const category = await Category.create(categoryData);
  res.status(201).json({ success: true, category });
});

export const getBrands = asyncHandler(async (req, res) => {
  const brands = await Brand.find({ isActive: true }).sort({ name: 1 }).lean();
  res.status(200).json({ success: true, brands });
});

export const createBrand = asyncHandler(async (req, res) => {
  const brandData = { ...req.body };

  if (req.file) {
    const uploaded = await uploadToCloudinary(req.file.path, 'console-ecommerce/brands');
    brandData.logo = uploaded;
  }

  const brand = await Brand.create(brandData);
  res.status(201).json({ success: true, brand });
});

export const deleteProductImage = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) {
    throw new AppError('Product not found', 404);
  }

  const image = product.images.id(req.params.imageId);
  if (!image) {
    throw new AppError('Image not found', 404);
  }

  await deleteFromCloudinary(image.public_id);
  image.deleteOne();
  await product.save();

  res.status(200).json({ success: true, message: 'Image deleted', product });
});
