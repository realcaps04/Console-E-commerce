import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/products/ProductCard';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import { analyticsAPI, productAPI } from '../api/services';

const HomePage = () => {
  const [featured, setFeatured] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [productsRes, recRes] = await Promise.all([
          productAPI.getProducts({ isFeatured: true, limit: 8 }),
          analyticsAPI.getRecommendations({ type: 'homepage', limit: 4 }),
        ]);
        setFeatured(productsRes.data.products);
        setRecommended(recRes.data.products);
      } catch (error) {
        console.error('Failed to fetch home data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div>
      <section className="border-b border-border">
        <div className="section-container py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
            <div>
              <p className="text-xs uppercase tracking-widest text-muted mb-4">New season</p>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-semibold leading-[1.15] text-ink mb-5">
                Good products,<br />straightforward shopping.
              </h1>
              <p className="text-muted leading-relaxed mb-8 max-w-md">
                Browse electronics, fashion, and home goods. Free delivery on orders over ₹999.
              </p>
              <Link to="/products" className="btn-primary">
                Browse shop
              </Link>
            </div>

            <div className="hidden lg:block aspect-[4/3] rounded-lg overflow-hidden bg-surface">
              <img
                src="https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&q=80"
                alt=""
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="section-container py-14">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="page-title">Featured</h2>
            <p className="muted-text mt-1">Hand-picked this week</p>
          </div>
          <Link to="/products" className="text-sm text-muted hover:text-ink underline-offset-4 hover:underline">
            View all
          </Link>
        </div>

        {loading ? (
          <ProductGridSkeleton count={4} />
        ) : featured.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
            {featured.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted">No featured products yet.</p>
        )}
      </section>

      {recommended.length > 0 && (
        <section className="border-t border-border bg-surface">
          <div className="section-container py-14">
            <h2 className="page-title mb-8">You might like</h2>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              {recommended.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="section-container py-14">
        <div className="grid sm:grid-cols-3 gap-6 text-center sm:text-left">
          <div>
            <p className="text-sm font-medium text-ink mb-1">Free shipping</p>
            <p className="text-sm text-muted">On orders above ₹999</p>
          </div>
          <div>
            <p className="text-sm font-medium text-ink mb-1">Easy returns</p>
            <p className="text-sm text-muted">30-day return window</p>
          </div>
          <div>
            <p className="text-sm font-medium text-ink mb-1">Secure checkout</p>
            <p className="text-sm text-muted">COD and online payment</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
