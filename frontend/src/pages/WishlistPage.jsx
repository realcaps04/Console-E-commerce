import { useSelector } from 'react-redux';
import { fetchMe } from '../redux/slices/authSlice';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import ProductCard from '../components/products/ProductCard';
import EmptyState from '../components/ui/EmptyState';
import { FiHeart } from 'react-icons/fi';

const WishlistPage = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchMe());
  }, [dispatch]);

  if (!user?.wishlist?.length) {
    return (
      <div className="section-container py-12">
        <EmptyState
          icon={FiHeart}
          title="Wishlist is empty"
          description="Save items you love to your wishlist"
          actionLabel="Browse Products"
          actionLink="/products"
        />
      </div>
    );
  }

  return (
    <div className="section-container py-8 lg:py-12">
      <h1 className="text-3xl font-display font-bold mb-8">My Wishlist</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {user.wishlist.map((product, i) => (
          <ProductCard key={product._id} product={product} index={i} />
        ))}
      </div>
    </div>
  );
};

export default WishlistPage;
