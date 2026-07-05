import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { productAPI } from '../../api/services';

export const fetchProducts = createAsyncThunk(
  'products/fetchProducts',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await productAPI.getProducts(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch products');
    }
  }
);

export const fetchProduct = createAsyncThunk(
  'products/fetchProduct',
  async (id, { rejectWithValue }) => {
    try {
      const { data } = await productAPI.getProduct(id);
      return data.product;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Product not found');
    }
  }
);

export const searchProducts = createAsyncThunk(
  'products/searchProducts',
  async (params, { rejectWithValue }) => {
    try {
      const { data } = await productAPI.searchProducts(params);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Search failed');
    }
  }
);

export const fetchCategories = createAsyncThunk(
  'products/fetchCategories',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await productAPI.getCategories();
      return data.categories;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch categories');
    }
  }
);

export const fetchBrands = createAsyncThunk(
  'products/fetchBrands',
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await productAPI.getBrands();
      return data.brands;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch brands');
    }
  }
);

const initialState = {
  products: [],
  product: null,
  categories: [],
  brands: [],
  pagination: { page: 1, limit: 12, total: 0, pages: 0 },
  filters: {
    search: '',
    category: '',
    brand: '',
    minPrice: '',
    maxPrice: '',
    minRating: '',
    sort: '',
    inStock: false,
  },
  loading: false,
  productLoading: false,
  error: null,
};

const productSlice = createSlice({
  name: 'products',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    clearFilters: (state) => {
      state.filters = initialState.filters;
    },
    clearProduct: (state) => {
      state.product = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.loading = false;
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchProduct.pending, (state) => {
        state.productLoading = true;
      })
      .addCase(fetchProduct.fulfilled, (state, action) => {
        state.productLoading = false;
        state.product = action.payload;
      })
      .addCase(fetchProduct.rejected, (state, action) => {
        state.productLoading = false;
        state.error = action.payload;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.products = action.payload.products;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categories = action.payload;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        state.brands = action.payload;
      });
  },
});

export const { setFilters, clearFilters, clearProduct } = productSlice.actions;
export default productSlice.reducer;
