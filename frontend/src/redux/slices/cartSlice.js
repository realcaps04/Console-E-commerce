import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { cartAPI } from '../../api/services';
import { getGuestCart, setGuestCart, calculateCartTotals } from '../../utils/helpers';

export const fetchCart = createAsyncThunk('cart/fetchCart', async (_, { rejectWithValue, getState }) => {
  const { auth } = getState();
  if (!auth.isAuthenticated) {
    const guestItems = getGuestCart();
    return { items: guestItems, isGuest: true };
  }
  try {
    const { data } = await cartAPI.getCart();
    return { ...data.cart, isGuest: false };
  } catch (error) {
    return rejectWithValue(error.response?.data?.message || 'Failed to fetch cart');
  }
});

export const addToCart = createAsyncThunk(
  'cart/addToCart',
  async ({ productId, quantity = 1, product }, { rejectWithValue, getState }) => {
    const { auth } = getState();

    if (!auth.isAuthenticated) {
      const guestCart = getGuestCart();
      const existing = guestCart.find((item) => item.productId === productId);
      if (existing) {
        existing.quantity += quantity;
      } else {
        guestCart.push({ productId, quantity, product });
      }
      setGuestCart(guestCart);
      return { items: guestCart, isGuest: true };
    }

    try {
      const { data } = await cartAPI.addToCart({ productId, quantity });
      return { ...data.cart, isGuest: false };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add to cart');
    }
  }
);

export const updateCartItem = createAsyncThunk(
  'cart/updateCartItem',
  async ({ itemId, quantity, productId }, { rejectWithValue, getState }) => {
    const { auth } = getState();

    if (!auth.isAuthenticated) {
      const guestCart = getGuestCart();
      const updated = guestCart.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      ).filter((item) => item.quantity > 0);
      setGuestCart(updated);
      return { items: updated, isGuest: true };
    }

    try {
      const { data } = await cartAPI.updateCartItem(itemId, quantity);
      return { ...data.cart, isGuest: false };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update cart');
    }
  }
);

export const removeFromCart = createAsyncThunk(
  'cart/removeFromCart',
  async ({ itemId, productId }, { rejectWithValue, getState }) => {
    const { auth } = getState();

    if (!auth.isAuthenticated) {
      const guestCart = getGuestCart().filter((item) => item.productId !== productId);
      setGuestCart(guestCart);
      return { items: guestCart, isGuest: true };
    }

    try {
      const { data } = await cartAPI.removeFromCart(itemId);
      return { ...data.cart, isGuest: false };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to remove item');
    }
  }
);

export const applyCoupon = createAsyncThunk(
  'cart/applyCoupon',
  async (code, { rejectWithValue }) => {
    try {
      const { data } = await cartAPI.applyCoupon(code);
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Invalid coupon');
    }
  }
);

const initialState = {
  items: [],
  coupon: null,
  discountAmount: 0,
  totals: calculateCartTotals([]),
  isGuest: true,
  loading: false,
  error: null,
};

const computeTotals = (state) => {
  const items = state.isGuest
    ? state.items.map((item) => ({
        product: item.product,
        price: item.product?.price,
        quantity: item.quantity,
        gst: item.product?.gst,
      }))
    : state.items;

  state.totals = calculateCartTotals(items, state.discountAmount);
};

const cartSlice = createSlice({
  name: 'cart',
  initialState,
  reducers: {
    clearCart: (state) => {
      state.items = [];
      state.coupon = null;
      state.discountAmount = 0;
      state.totals = calculateCartTotals([]);
    },
    syncGuestCartLocal: (state, action) => {
      state.items = action.payload;
      state.isGuest = true;
      computeTotals(state);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.isGuest) {
          state.items = action.payload.items;
          state.isGuest = true;
        } else {
          state.items = action.payload.items || [];
          state.coupon = action.payload.coupon;
          state.isGuest = false;
        }
        computeTotals(state);
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        if (action.payload.isGuest) {
          state.items = action.payload.items;
          state.isGuest = true;
        } else {
          state.items = action.payload.items || [];
          state.isGuest = false;
        }
        computeTotals(state);
      })
      .addCase(updateCartItem.fulfilled, (state, action) => {
        if (action.payload.isGuest) {
          state.items = action.payload.items;
        } else {
          state.items = action.payload.items || [];
        }
        computeTotals(state);
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        if (action.payload.isGuest) {
          state.items = action.payload.items;
        } else {
          state.items = action.payload.items || [];
        }
        computeTotals(state);
      })
      .addCase(applyCoupon.fulfilled, (state, action) => {
        state.discountAmount = action.payload.discountAmount;
        state.coupon = action.payload.cart?.coupon;
        computeTotals(state);
      });
  },
});

export const { clearCart, syncGuestCartLocal } = cartSlice.actions;
export default cartSlice.reducer;
