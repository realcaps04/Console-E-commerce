import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchProducts, fetchCategories, fetchBrands, setFilters } from '../redux/slices/productSlice';
import ProductCard from '../components/products/ProductCard';
import ProductFilters from '../components/products/ProductFilters';
import { ProductGridSkeleton } from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import { FiShoppingBag } from 'react-icons/fi';

const ProductsPage = () => {
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const { products, pagination, loading, filters } = useSelector((state) => state.products);

  useEffect(() => {
    dispatch(fetchCategories());
    dispatch(fetchBrands());
  }, [dispatch]);

  useEffect(() => {
    const params = Object.fromEntries(searchParams);
    const mergedFilters = { ...filters, ...params };
    dispatch(setFilters(mergedFilters));

    const queryParams = {};
    Object.entries(mergedFilters).forEach(([key, value]) => {
      if (value && value !== false) queryParams[key] = value;
    });
    if (params.search) queryParams.search = params.search;

    dispatch(fetchProducts(queryParams));
  }, [dispatch, searchParams]);

  const handleFilterChange = (newFilters) => {
    const queryParams = {};
    Object.entries({ ...filters, ...newFilters }).forEach(([key, value]) => {
      if (value && value !== false) queryParams[key] = value;
    });
    dispatch(fetchProducts(queryParams));
  };

  const handlePageChange = (page) => {
    const queryParams = {};
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== false) queryParams[key] = value;
    });
    dispatch(fetchProducts({ ...queryParams, page }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="section-container py-10 lg:py-12">
      <div className="mb-8">
        <h1 className="page-title">Shop</h1>
        <p className="muted-text mt-1">
          {pagination.total} {pagination.total === 1 ? 'product' : 'products'}
        </p>
      </div>

      <div className="grid lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <ProductFilters onFilterChange={handleFilterChange} />
        </aside>

        <div className="lg:col-span-3">
          {loading ? (
            <ProductGridSkeleton />
          ) : products.length === 0 ? (
            <EmptyState
              icon={FiShoppingBag}
              title="No products found"
              description="Try adjusting your filters or search query"
              actionLabel="Clear Filters"
              actionLink="/products"
            />
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {products.map((product) => (
                  <ProductCard key={product._id} product={product} />
                ))}
              </div>

              {pagination.pages > 1 && (
                <div className="flex justify-center gap-2 mt-12">
                  {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`w-9 h-9 rounded-md text-sm font-medium transition-colors ${
                        pagination.page === page
                          ? 'bg-ink text-white'
                          : 'border border-border hover:bg-surface'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductsPage;
