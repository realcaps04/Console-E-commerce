import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FiSearch, FiX } from 'react-icons/fi';
import { setFilters } from '../../redux/slices/productSlice';
import { useDebounce } from '../../hooks/useAuth';

const ProductFilters = ({ onFilterChange }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { filters, categories, brands } = useSelector((state) => state.products);
  const [searchInput, setSearchInput] = useState(filters.search);
  const debouncedSearch = useDebounce(searchInput);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    dispatch(setFilters(newFilters));
    onFilterChange?.(newFilters);
  };

  useEffect(() => {
    if (debouncedSearch !== filters.search) {
      handleFilterChange('search', debouncedSearch);
    }
  }, [debouncedSearch]);

  const clearAll = () => {
    setSearchInput('');
    dispatch(setFilters({
      search: '',
      category: '',
      brand: '',
      minPrice: '',
      maxPrice: '',
      minRating: '',
      sort: '',
      inStock: false,
    }));
    onFilterChange?.({});
  };

  const hasFilters = Object.values(filters).some((v) => v && v !== false);

  return (
    <div className="border border-border rounded-lg p-5 space-y-5 bg-white">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-ink">Filters</h3>
        {hasFilters && (
          <button onClick={clearAll} className="text-xs text-muted hover:text-ink flex items-center gap-1">
            <FiX className="w-3.5 h-3.5" /> Clear
          </button>
        )}
      </div>

      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search products..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && navigate(`/products?search=${searchInput}`)}
          className="input-field pl-10"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Sort By</label>
        <select
          value={filters.sort}
          onChange={(e) => handleFilterChange('sort', e.target.value)}
          className="input-field"
        >
          <option value="">Default</option>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: Low to High</option>
          <option value="price_desc">Price: High to Low</option>
          <option value="rating">Highest Rated</option>
          <option value="popular">Most Popular</option>
          <option value="discount">Best Discount</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
          className="input-field"
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat._id} value={cat._id}>{cat.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Brand</label>
        <select
          value={filters.brand}
          onChange={(e) => handleFilterChange('brand', e.target.value)}
          className="input-field"
        >
          <option value="">All Brands</option>
          {brands.map((brand) => (
            <option key={brand._id} value={brand._id}>{brand.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-2">Min Price</label>
          <input
            type="number"
            placeholder="0"
            value={filters.minPrice}
            onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            className="input-field"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Max Price</label>
          <input
            type="number"
            placeholder="999999"
            value={filters.maxPrice}
            onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            className="input-field"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">Min Rating</label>
        <select
          value={filters.minRating}
          onChange={(e) => handleFilterChange('minRating', e.target.value)}
          className="input-field"
        >
          <option value="">Any Rating</option>
          <option value="4">4+ Stars</option>
          <option value="3">3+ Stars</option>
          <option value="2">2+ Stars</option>
        </select>
      </div>

      <label className="flex items-center gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={filters.inStock}
          onChange={(e) => handleFilterChange('inStock', e.target.checked)}
          className="w-4 h-4 rounded border-border text-ink focus:ring-ink/20"
        />
        <span className="text-sm font-medium">In Stock Only</span>
      </label>
    </div>
  );
};

export default ProductFilters;
