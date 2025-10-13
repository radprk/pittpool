import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  verifyEmail: (data: any) => api.post('/auth/verify-email', data),
  verifyPhone: (data: any) => api.post('/auth/verify-phone', data),
};

// Users API
export const usersAPI = {
  getMe: () => api.get('/users/me'),
  updateMe: (data: any) => api.put('/users/me', data),
  getUserById: (id: string) => api.get(`/users/${id}`),
  uploadDocument: (data: any) => api.post('/users/upload-document', data),
};

// Rides API
export const ridesAPI = {
  create: (data: any) => api.post('/rides', data),
  getAll: (params?: any) => api.get('/rides', { params }),
  getMyRides: () => api.get('/rides/my-rides'),
  getById: (id: string) => api.get(`/rides/${id}`),
  update: (id: string, data: any) => api.put(`/rides/${id}`, data),
  delete: (id: string) => api.delete(`/rides/${id}`),
  getMatches: (id: string) => api.get(`/rides/${id}/matches`),
};

// Requests API
export const requestsAPI = {
  create: (data: any) => api.post('/requests', data),
  getMyRequests: () => api.get('/requests/my-requests'),
  getById: (id: string) => api.get(`/requests/${id}`),
  update: (id: string, data: any) => api.put(`/requests/${id}`, data),
  delete: (id: string) => api.delete(`/requests/${id}`),
  getMatches: (id: string) => api.get(`/requests/${id}/matches`),
};

// Bookings API
export const bookingsAPI = {
  create: (data: any) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my-bookings'),
  getById: (id: string) => api.get(`/bookings/${id}`),
  confirm: (id: string) => api.put(`/bookings/${id}/confirm`),
  complete: (id: string) => api.put(`/bookings/${id}/complete`),
  cancel: (id: string) => api.put(`/bookings/${id}/cancel`),
};

// Messages API
export const messagesAPI = {
  getConversations: () => api.get('/messages/conversations'),
  getChatHistory: (userId: string) => api.get(`/messages/${userId}`),
  send: (data: any) => api.post('/messages', data),
  markAsRead: (id: string) => api.put(`/messages/${id}/read`),
};

// Payments API
export const paymentsAPI = {
  createIntent: (data: any) => api.post('/payments/create-intent', data),
  confirm: (data: any) => api.post('/payments/confirm', data),
  refund: (data: any) => api.post('/payments/refund', data),
  getStatus: (bookingId: string) => api.get(`/payments/status/${bookingId}`),
};

// Ratings API
export const ratingsAPI = {
  create: (data: any) => api.post('/ratings', data),
  getUserRatings: (userId: string) => api.get(`/ratings/user/${userId}`),
};

