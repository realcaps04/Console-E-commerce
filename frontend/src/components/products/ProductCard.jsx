import { Link } from 'react-router-dom';
import { FiStar } from 'react-icons/fi';
import { formatPrice, calculateDiscount } from '../../utils/helpers';

const ProductCard = ({ product }) => {
  const discount = calculateDiscount(product.mrp, product.price);
  const imageUrl = product.images?.[0]?.url || 'https://via.placeholder.com/400';

  return (
    <Link
      to={`/products/${product._id}`}
      className="group block border border-border rounded-lg overflow-hidden bg-white hover:border-gray-300 transition-colors"
    >
      <div className="relative aspect-[4/5] overflow-hidden bg-surface">
        <img
          src={imageUrl}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        {discount > 0 && (
          <span className="absolute top-2.5 left-2.5 px-1.5 py-0.5 bg-ink text-white text-[11px] font-medium">
            {discount}% off
          </span>
        )}
        {product.stock === 0 && (
          <span className="absolute inset-0 bg-white/80 flex items-center justify-center">
            <span className="text-sm font-medium text-muted">Sold out</span>
          </span>
        )}
      </div>

      <div className="p-3.5">
        {product.category?.name && (
          <p className="text-[11px] uppercase tracking-wide text-muted mb-1">{product.category.name}</p>
        )}
        <h3 className="text-sm font-medium text-ink line-clamp-2 leading-snug mb-2">
          {product.name}
        </h3>

        <div className="flex items-center gap-1 mb-2">
          <FiStar className="w-3 h-3 text-amber-500 fill-amber-500" />
          <span className="text-xs text-muted">
            {product.ratings?.toFixed(1) || '0.0'} ({product.numReviews || 0})
          </span>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-sm font-semibold text-ink">{formatPrice(product.price)}</span>
          {product.mrp > product.price && (
            <span className="text-xs text-muted line-through">{formatPrice(product.mrp)}</span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
