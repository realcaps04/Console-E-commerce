import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { FiStar, FiHeart, FiMinus, FiPlus } from 'react-icons/fi';
import { fetchProduct, clearProduct } from '../redux/slices/productSlice';
import { addToCart } from '../redux/slices/cartSlice';
import { authAPI, analyticsAPI } from '../api/services';
import ProductCard from '../components/products/ProductCard';
import Spinner from '../components/ui/Spinner';
import { formatPrice, calculateDiscount } from '../utils/helpers';

const ProductDetailPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { product, productLoading } = useSelector((state) => state.products);
  const { isAuthenticated } = useSelector((state) => state.auth);
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);
  const [recommendations, setRecommendations] = useState([]);

  useEffect(() => {
    dispatch(fetchProduct(id));
    return () => dispatch(clearProduct());
  }, [dispatch, id]);

  useEffect(() => {
    analyticsAPI.getRecommendations({ type: 'product', productId: id, limit: 4 })
      .then(({ data }) => setRecommendations(data.products))
      .catch(() => {});
  }, [id]);

  const handleAddToCart = () => {
    if (!product || product.stock === 0) return;
    dispatch(addToCart({ productId: product._id, quantity, product }));
    toast.success('Added to cart!');
  };

  const handleBuyNow = () => {
    handleAddToCart();
    navigate('/cart');
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to add to wishlist');
      navigate('/login');
      return;
    }
    try {
      await authAPI.addToWishlist(id);
      toast.success('Wishlist updated!');
    } catch {
      toast.error('Failed to update wishlist');
    }
  };

  if (productLoading) {
    return (
      <div className="section-container py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="section-container py-20 text-center">
        <h2 className="text-2xl font-bold mb-4">Product not found</h2>
        <button onClick={() => navigate('/products')} className="btn-primary">
          Back to Shop
        </button>
      </div>
    );
  }

  const discount = calculateDiscount(product.mrp, product.price);
  const images = product.images?.length ? product.images : [{ url: 'https://via.placeholder.com/600' }];

  return (
    <div className="section-container py-8 lg:py-12">
      <div className="grid lg:grid-cols-2 gap-12">
        <div className="space-y-3">
          <div className="aspect-square rounded-lg overflow-hidden bg-surface border border-border">
            <img
              src={images[selectedImage]?.url}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {images.length > 1 && (
            <div className="flex gap-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImage(i)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 ${
                    selectedImage === i ? 'border-primary-500' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div>
          {product.category?.name && (
            <span className="text-primary-500 text-sm font-medium">{product.category.name}</span>
          )}
          <h1 className="text-2xl font-semibold text-ink mt-1 mb-3">{product.name}</h1>

          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <FiStar
                  key={i}
                  className={`w-5 h-5 ${i < Math.round(product.ratings) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                />
              ))}
            </div>
            <span className="text-gray-500">({product.numReviews} reviews)</span>
            <span className="text-gray-400">|</span>
            <span className="text-gray-500">SKU: {product.sku}</span>
          </div>

          <div className="flex items-baseline gap-3 mb-6">
            <span className="text-2xl font-semibold text-ink">{formatPrice(product.price)}</span>
            {product.mrp > product.price && (
              <>
                <span className="text-base text-muted line-through">{formatPrice(product.mrp)}</span>
                <span className="text-xs font-medium text-red-700 bg-red-50 px-1.5 py-0.5">
                  {discount}% off
                </span>
              </>
            )}
          </div>

          <p className="text-muted text-sm leading-relaxed mb-6">{product.description}</p>

          <p className="text-sm text-muted mb-6">
            {product.stock > 0 ? (
              <span className="text-green-700">In stock</span>
            ) : (
              <span className="text-red-600">Out of stock</span>
            )}
          </p>

          {product.stock > 0 && (
            <div className="flex items-center gap-4 mb-8">
              <div className="flex items-center border border-border rounded-md">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2.5 hover:bg-surface"
                >
                  <FiMinus className="w-4 h-4" />
                </button>
                <span className="px-4 text-sm font-medium">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                  className="p-2.5 hover:bg-surface"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-3 mb-8">
            <button
              onClick={handleAddToCart}
              disabled={product.stock === 0}
              className="btn-primary"
            >
              Add to cart
            </button>
            <button onClick={handleBuyNow} disabled={product.stock === 0} className="btn-secondary">
              Buy now
            </button>
            <button onClick={handleWishlist} className="btn-secondary px-3" aria-label="Wishlist">
              <FiHeart className="w-4 h-4" />
            </button>
          </div>

          <div className="border border-border rounded-lg p-4 text-sm text-muted space-y-1">
            <p>GST: {product.gst}%</p>
            {product.brand?.name && <p>Brand: {product.brand.name}</p>}
          </div>
        </div>
      </div>

      {product.reviews?.length > 0 && (
        <section className="mt-16">
          <h2 className="text-lg font-semibold mb-4">Reviews</h2>
          <div className="space-y-4">
            {product.reviews.map((review) => (
              <div key={review._id} className="border border-border rounded-lg p-4">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <FiStar key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'text-amber-500 fill-amber-500' : 'text-gray-200'}`} />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{review.name}</span>
                </div>
                <p className="text-sm text-muted">{review.comment}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {recommendations.length > 0 && (
        <section className="mt-16">
          <h2 className="text-lg font-semibold mb-6">Often bought together</h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {recommendations.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default ProductDetailPage;
