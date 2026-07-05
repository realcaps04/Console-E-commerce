import express from 'express';
import {
  getProducts,
  getProduct,
  getProductBySlug,
  createProduct,
  updateProduct,
  deleteProduct,
  createReview,
  searchProducts,
  getCategories,
  createCategory,
  getBrands,
  createBrand,
  deleteProductImage,
} from '../controllers/productController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { productValidation, reviewValidation } from '../validators/authValidator.js';

const router = express.Router();

router.get('/search', searchProducts);
router.get('/categories', getCategories);
router.post('/categories', protect, authorize('admin'), upload.single('image'), createCategory);
router.get('/brands', getBrands);
router.post('/brands', protect, authorize('admin'), upload.single('logo'), createBrand);

router.route('/').get(getProducts).post(protect, authorize('admin'), upload.array('images', 5), productValidation, validate, createProduct);

router.get('/slug/:slug', optionalAuth, getProductBySlug);
router.get('/:id', optionalAuth, getProduct);
router.put('/:id', protect, authorize('admin'), upload.array('images', 5), updateProduct);
router.delete('/:id', protect, authorize('admin'), deleteProduct);
router.post('/:id/reviews', protect, reviewValidation, validate, createReview);
router.delete('/:id/images/:imageId', protect, authorize('admin'), deleteProductImage);

export default router;
