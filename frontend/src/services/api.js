import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Attach JWT token to every request if present
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('novamart_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for clean data extraction & token expiration handling
api.interceptors.response.use(
  (response) => {
    // If backend returns ApiResponse structure with .data, unwrap it
    if (response.data && response.data.hasOwnProperty('data')) {
      return response.data;
    }
    return response.data;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Don't auto-clear on failed login/register attempts
      const url = error.config?.url || '';
      if (!url.includes('/api/auth/login') && !url.includes('/api/delivery-partners/login')) {
        localStorage.removeItem('novamart_token');
        localStorage.removeItem('novamart_user');
      }
    }

    if (error.response && error.response.status === 429) {
      const retryAfter = error.response.headers?.['retry-after'];
      const defaultMsg = error.response?.data?.message || 'Rate limit exceeded. Please wait a moment before trying again.';
      const message = retryAfter 
        ? `Rate limit exceeded. Please wait ${retryAfter} seconds before trying again.` 
        : defaultMsg;
      return Promise.reject(new Error(message));
    }

    const message = error.response?.data?.message || error.response?.data?.error || error.message || 'An error occurred';
    return Promise.reject(new Error(message));
  }
);

// Authentication Endpoints
export const authAPI = {
  login: (credentials) => api.post('/api/auth/login', credentials),
  register: (userData) => api.post('/api/auth/register', userData),
  logout: () => api.post('/api/auth/logout'),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/api/auth/reset-password', data),
  getMe: () => api.get('/api/auth/me'),
};

// Catalog & Products
export const productAPI = {
  getProducts: (params) => api.get('/api/products', { params }),
  getProductById: (id) => api.get(`/api/products/${id}`),
  getBrands: () => api.get('/api/products/brands'),
};

// Categories
export const categoryAPI = {
  getAll: () => api.get('/api/categories'),
  getById: (id) => api.get(`/api/categories/${id}`),
  create: (data) => api.post('/api/categories', data),
  update: (id, data) => api.put(`/api/categories/${id}`, data),
  delete: (id) => api.delete(`/api/categories/${id}`),
};

// Cart
export const cartAPI = {
  getCart: () => api.get('/api/cart'),
  addItem: (data) => api.post('/api/cart/items', data),
  updateQuantity: (id, quantity) => api.put(`/api/cart/items/${id}`, { quantity }),
  removeItem: (id) => api.delete(`/api/cart/items/${id}`),
  clearCart: () => api.delete('/api/cart/clear'),
};

// Orders
export const orderAPI = {
  createOrder: (orderData) => api.post('/api/orders', orderData),
  getUserOrders: () => api.get('/api/orders'),
  getOrderById: (id) => api.get(`/api/orders/${id}`),
  cancelOrder: (id, reason) => api.post(`/api/orders/${id}/cancel`, { reason }),
  requestReturn: (id, reason) => api.post(`/api/orders/${id}/return`, { reason }),
};

// Addresses
export const addressAPI = {
  getAddresses: () => api.get('/api/addresses'),
  createAddress: (data) => api.post('/api/addresses', data),
  updateAddress: (id, data) => api.put(`/api/addresses/${id}`, data),
  deleteAddress: (id) => api.delete(`/api/addresses/${id}`),
  setDefaultAddress: (id) => api.put(`/api/addresses/${id}/default`),
};

// Payments
export const paymentAPI = {
  createIntent: (data) => api.post('/api/payments/create', data),
  verify: (data) => api.post('/api/payments/verify', data),
};

// Delivery Partner Portal
export const deliveryPartnerAPI = {
  register: (data) => api.post('/api/delivery-partners/register', data),
  login: (credentials) => api.post('/api/delivery-partners/login', credentials),
  getProfile: () => api.get('/api/delivery-partners/profile'),
  toggleAvailability: (available) => api.put('/api/delivery-partners/status', { available }),
  getDeliveries: () => api.get('/api/delivery-partners/deliveries'),
  accept: (id) => api.post(`/api/delivery-partners/deliveries/${id}/accept`),
  pickup: (id) => api.post(`/api/delivery-partners/deliveries/${id}/pickup`),
  outForDelivery: (id) => api.post(`/api/delivery-partners/deliveries/${id}/out-for-delivery`),
  deliver: (id, otp) => api.post(`/api/delivery-partners/deliveries/${id}/deliver`, { otp }),
  failed: (id, reason) => api.post(`/api/delivery-partners/deliveries/${id}/failed`, { failureReason: reason }),
};

// Admin Delivery Management
export const adminDeliveryAPI = {
  getPartners: (status) => api.get('/api/admin/delivery-partners', { params: { status } }),
  approvePartner: (id, zoneIds) => api.post(`/api/admin/delivery-partners/${id}/approve`, { zoneIds }),
  rejectPartner: (id) => api.post(`/api/admin/delivery-partners/${id}/reject`),
  getZones: () => api.get('/api/admin/delivery-zones'),
  createZone: (data) => api.post('/api/admin/delivery-zones', data),
  updateZone: (id, data) => api.put(`/api/admin/delivery-zones/${id}`, data),
  deleteZone: (id) => api.delete(`/api/admin/delivery-zones/${id}`),
  assignDelivery: (orderId, partnerId, notes) => api.post(`/api/admin/deliveries/${orderId}/assign`, { partnerId, notes }),
  reassignDelivery: (orderId, partnerId, notes) => api.put(`/api/admin/deliveries/${orderId}/reassign`, { partnerId, notes }),
};

// Admin Operations
export const adminOrderAPI = {
  getAllOrders: () => api.get('/api/admin/orders'),
  updateStatus: (id, status) => api.put(`/api/admin/orders/${id}/status`, { status }),
  getDashboardStats: () => api.get('/api/admin/reports/dashboard'),
  getCustomers: () => api.get('/api/admin/customers'),
  toggleCustomerStatus: (id, active) => api.put(`/api/admin/customers/${id}/status`, { active }),
};

export const adminProductAPI = {
  getAllAdmin: () => api.get('/api/admin/products'),
  create: (data) => api.post('/api/admin/products', data),
  update: (id, data) => api.put(`/api/admin/products/${id}`, data),
  delete: (id) => api.delete(`/api/admin/products/${id}`),
  getLowStock: (threshold) => api.get('/api/admin/products/low-stock', { params: { threshold } }),
};

// Coupons
export const couponAPI = {
  validate: (code, amount) => api.get(`/api/coupons/validate/${code}`, { params: { amount } }),
  getAllAdmin: () => api.get('/api/admin/coupons'),
  create: (data) => api.post('/api/admin/coupons', data),
  delete: (id) => api.delete(`/api/admin/coupons/${id}`),
};

// Reviews
export const reviewAPI = {
  getProductReviews: (productId) => api.get(`/api/products/${productId}/reviews`),
  addReview: (productId, data) => api.post(`/api/products/${productId}/reviews`, data),
  getAllAdmin: () => api.get('/api/admin/reviews'),
  deleteReview: (id) => api.delete(`/api/admin/reviews/${id}`),
};

export default api;
