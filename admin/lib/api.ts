import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

const api = axios.create({
    baseURL: API_URL,
});

// Request interceptor
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('adminToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Auth API
export const authAPI = {
    login: (data: any) => api.post('/auth/login', data),
    logout: () => api.post('/auth/logout'),
};

// Dashboard API
export const dashboardAPI = {
    getStats: () => api.get('/dashboard/stats'),
};

// Products API
export const productsAPI = {
    getAll: (params?: any) => api.get('/products', { params }),
    getOne: (id: string) => api.get(`/products/${id}`),
    create: (data: any) => api.post('/products', data),
    update: (id: string, data: any) => api.patch(`/products/${id}`, data),
    delete: (id: string) => api.delete(`/products/${id}`),
};

// Orders API
export const ordersAPI = {
    getAll: (params?: any) => api.get('/orders/admin/all', { params }),
    getOne: (id: string) => api.get(`/orders/${id}`),
    updateStatus: (id: string, status: string) =>
        api.patch(`/orders/${id}/status`, { status }),
    getReadyToPrint: (search?: string) =>
        api.get('/orders/admin/ready-to-print', { params: { search } }),
    markAsPrinted: (orderIds: string[]) =>
        api.post('/orders/admin/mark-printed', { orderIds }),
};

// Categories API
export const categoriesAPI = {
    getAll: () => api.get('/categories'),
    getOne: (id: string) => api.get(`/categories/${id}`),
    create: (data: any) => api.post('/categories', data),
    update: (id: string, data: any) => api.patch(`/categories/${id}`, data),
    delete: (id: string) => api.delete(`/categories/${id}`),
};

// Banners API
export const bannersAPI = {
    getAll: () => api.get('/banners/admin/all'),
    getOne: (id: string) => api.get(`/banners/${id}`),
    create: (data: any) => api.post('/banners', data),
    update: (id: string, data: any) => api.patch(`/banners/${id}`, data),
    delete: (id: string) => api.delete(`/banners/${id}`),
};

// Coupons API
export const couponsAPI = {
    getAll: () => api.get('/coupons'),
    getOne: (id: string) => api.get(`/coupons/${id}`),
    create: (data: any) => api.post('/coupons', data),
    update: (id: string, data: any) => api.patch(`/coupons/${id}`, data),
    delete: (id: string) => api.delete(`/coupons/${id}`),
};

// Users API
export const usersAPI = {
    getAll: (params?: any) => api.get('/users/admin/all', { params }),
    getProfile: () => api.get('/users/profile'),
    getOne: (id: string) => api.get(`/users/admin/${id}`),
    create: (data: any) => api.post('/users/admin/create', data),
    update: (id: string, data: any) => api.patch(`/users/admin/${id}`, data),
    updateRole: (id: string, role: string, roleId?: string | null) =>
        api.patch(`/users/admin/${id}/role`, { role, roleId }),
    delete: (id: string) => api.delete(`/users/admin/${id}`),
};

// Roles API
export const rolesAPI = {
    getAll: () => api.get('/roles'),
    getOne: (id: string) => api.get(`/roles/${id}`),
    create: (data: any) => api.post('/roles', data),
    update: (id: string, data: any) => api.patch(`/roles/${id}`, data),
    delete: (id: string) => api.delete(`/roles/${id}`),
};

// Reports API
export const reportsAPI = {
    getStats: () => api.get('/dashboard/stats'),
    getSales: (period: string) => api.get(`/reports/sales?period=${period}`),
    getCustomers: () => api.get('/reports/customers'),
};

// Upload API
export const uploadAPI = {
    upload: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return api.post('/upload/image', formData);
    },
};

// Invoices API
export const invoicesAPI = {
    getDownloadUrl: (id: string, download = false) =>
        `${API_URL}/invoices/${id}${download ? '?download=true' : ''}`,
    getBulkPrintUrl: (ids: string[], download = false) =>
        `${API_URL}/invoices/bulk/print?ids=${ids.join(',')}${download ? '&download=true' : ''}`,
};

export default api;
