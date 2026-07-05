import api from './axios';

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
  deleteAccount: () => api.delete('/auth/account'),
  addToWishlist: (productId) => api.post(`/auth/wishlist/${productId}`),
};

export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  getProductBySlug: (slug) => api.get(`/products/slug/${slug}`),
  searchProducts: (params) => api.get('/products/search', { params }),
  getCategories: () => api.get('/products/categories'),
  getBrands: () => api.get('/products/brands'),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  createReview: (id, data) => api.post(`/products/${id}/reviews`, data),
};

export const orderAPI = {
  createOrder: (data) => api.post('/orders', data),
  getMyOrders: (params) => api.get('/orders/my', { params }),
  getOrder: (id) => api.get(`/orders/${id}`),
  getAllOrders: (params) => api.get('/orders', { params }),
  updateOrderStatus: (id, data) => api.put(`/orders/${id}`, data),
  cancelOrder: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
  requestReturn: (id, reason) => api.put(`/orders/${id}/return`, { reason }),
  validateCoupon: (code, orderAmount) =>
    api.post('/orders/validate-coupon', { code, orderAmount }),
};

export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart', data),
  updateCartItem: (itemId, quantity) => api.put(`/cart/${itemId}`, { quantity }),
  removeFromCart: (itemId) => api.delete(`/cart/${itemId}`),
  clearCart: () => api.delete('/cart'),
  applyCoupon: (code) => api.post('/cart/coupon', { code }),
  removeCoupon: () => api.delete('/cart/coupon'),
  syncGuestCart: (items) => api.post('/cart/sync', { items }),
};

export const contactAPI = {
  submit: (data) => api.post('/contact', data),
};

export const analyticsAPI = {
  getRecommendations: (params) => api.get('/analytics/recommendations', { params }),
  getDashboard: () => api.get('/analytics/dashboard'),
};
