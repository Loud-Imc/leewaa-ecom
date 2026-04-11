import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

// Create axios instance
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // If 401 and not already retried
        if (error.response?.status === 401 && !originalRequest._retry && typeof window !== 'undefined') {
            console.log('DEBUG: 401 Unauthorized for URL:', originalRequest.url);
            originalRequest._retry = true;

            try {
                const refreshToken = localStorage.getItem('refreshToken');
                if (refreshToken) {
                    const response = await axios.post(`${API_URL}/auth/refresh`, {
                        refreshToken,
                    });

                    const { accessToken } = response.data;
                    localStorage.setItem('accessToken', accessToken);

                    // Retry original request with new token
                    originalRequest.headers.Authorization = `Bearer ${accessToken}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                // Refresh failed, logout user
                localStorage.removeItem('accessToken');
                localStorage.removeItem('refreshToken');
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

// Auth API
export const authAPI = {
    register: (data: any) => api.post('/auth/register', data),
    login: (data: any) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
    refresh: (refreshToken: string) => api.post('/auth/refresh', { refreshToken }),
};

// Products API
export const productsAPI = {
    getAll: (params?: any) => api.get('/products', { params }),
    getOne: (id: string) => api.get(`/products/${id}`),
    getBySlug: (slug: string) => api.get(`/products/slug/${slug}`),
};

// Categories API
export const categoriesAPI = {
    getAll: () => api.get('/categories'),
    getTree: () => api.get('/categories/tree'),
};

// Cart API (to be implemented in backend)
export const cartAPI = {
    get: () => api.get('/cart'),
    add: (data: any) => api.post('/cart', data),
    update: (id: string, data: any) => api.patch(`/cart/${id}`, data),
    remove: (id: string) => api.delete(`/cart/${id}`),
    clear: () => api.delete('/cart'),
};

// Addresses API
export const addressesAPI = {
    getAll: () => api.get('/addresses'),
    create: (data: any) => api.post('/addresses', data),
    update: (id: string, data: any) => api.patch(`/addresses/${id}`, data),
    setDefault: (id: string) => api.patch(`/addresses/${id}/default`),
    delete: (id: string) => api.delete(`/addresses/${id}`),
};

// Orders API
export const ordersAPI = {
    create: (data: any) => api.post('/orders', data),
    getUserOrders: (params?: any) => api.get('/orders', { params }),
    getOne: (id: string) => api.get(`/orders/${id}`),
    cancel: (id: string) => api.patch(`/orders/${id}/cancel`),
    verifyPayment: (id: string, data: { razorpayPaymentId: string; razorpaySignature: string }) =>
        api.post(`/orders/${id}/verify`, data),
    validateCoupon: (code: string, subtotal: number, cartItems?: any[]) =>
        api.post('/orders/validate-coupon', { code, subtotal, cartItems }),
    track: (orderNumber: string, phone: string) =>
        api.get('/orders/track', { params: { orderNumber, phone } }),
};

// Banners API
export const bannersAPI = {
    getActive: () => api.get('/banners'),
};

// Wishlist API
export const wishlistAPI = {
    get: () => api.get('/wishlist'),
    add: (productId: string) => api.post(`/wishlist/${productId}`),
    remove: (productId: string) => api.delete(`/wishlist/${productId}`),
    clear: () => api.delete('/wishlist'),
};

// Users API
export const usersAPI = {
    getProfile: () => api.get('/users/profile'),
    updateProfile: (data: any) => api.patch('/users/profile', data),
};

// Invoices API
export const invoicesAPI = {
    getDownloadUrl: (id: string) => `${API_URL}/invoices/${id}`,
};

export default api;
