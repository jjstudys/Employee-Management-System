import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:5001/api/v1';

const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: { 'Content-Type': 'application/json' },
});

export const setAccessToken = (token) => {
  if (token) {
    localStorage.setItem('accessToken', token);
  } else {
    localStorage.removeItem('accessToken');
  }
};

export const getAccessToken = () => localStorage.getItem('accessToken') || null;

api.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshPromise = null;

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !original.skipAuthRefresh &&
      !original.url?.startsWith('/auth/') &&
      !original.url?.includes('/auth/refresh')
    ) {
      original._retry = true;
      try {
        refreshPromise ||= axios.post(`${API_URL}/auth/refresh`, {}, { withCredentials: true });
        const { data } = await refreshPromise;
        setAccessToken(data.data.accessToken);
        original.headers.Authorization = `Bearer ${data.data.accessToken}`;
        return api(original);
      } catch {
        setAccessToken(null);
        window.location.href = '/login';
      } finally {
        refreshPromise = null;
      }
    }
    return Promise.reject(error);
  }
);

export default api;

export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  refresh: () => api.post('/auth/refresh', {}),
  logout: () => api.post('/auth/logout', {}),
  getProfile: (config = {}) => api.get('/auth/profile', config),
  changePassword: (data) => api.post('/auth/change-password', data),
};

export const employeeAPI = {
  getAll: (params) => api.get('/employees', { params }),
  getById: (id) => api.get(`/employees/${id}`),
  create: (data) => api.post('/employees', data),
  update: (id, data) => api.put(`/employees/${id}`, data),
  uploadPhoto: (id, formData) =>
    api.post(`/employees/${id}/photo`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  delete: (id) => api.delete(`/employees/${id}`),
};

export const userAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
};

export const departmentAPI = {
  getAll: (params) => api.get('/departments', { params }),
  getById: (id) => api.get(`/departments/${id}`),
  create: (data) => api.post('/departments', data),
  update: (id, data) => api.put(`/departments/${id}`, data),
  delete: (id) => api.delete(`/departments/${id}`),
};

export const designationAPI = {
  getAll: (params) => api.get('/designations', { params }),
  create: (data) => api.post('/designations', data),
  update: (id, data) => api.put(`/designations/${id}`, data),
  delete: (id) => api.delete(`/designations/${id}`),
};

export const attendanceAPI = {
  getAll: (params) => api.get('/attendance', { params }),
  checkIn: (data) => api.post('/attendance/check-in', data),
  checkOut: (data) => api.post('/attendance/check-out', data),
  getStats: (params) => api.get('/attendance/stats', { params }),
};

export const leaveAPI = {
  getAll: (params) => api.get('/leaves', { params }),
  create: (data) => api.post('/leaves', data),
  approve: (id, data) => api.patch(`/leaves/${id}/approve`, data),
  cancel: (id) => api.patch(`/leaves/${id}/cancel`),
};

export const payrollAPI = {
  getAll: (params) => api.get('/payroll', { params }),
  create: (data) => api.post('/payroll', data),
  process: (id) => api.patch(`/payroll/${id}/process`),
  markPaid: (id) => api.patch(`/payroll/${id}/pay`),
  generateBulk: (data) => api.post('/payroll/generate-bulk', data),
};

export const dashboardAPI = {
  getAnalytics: () => api.get('/dashboard/analytics'),
  getEmployeeDashboard: () => api.get('/dashboard/employee'),
};

export const notificationAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
};

export const announcementAPI = {
  getActive: () => api.get('/announcements/active'),
  getAll: (params) => api.get('/announcements', { params }),
  create: (data) => api.post('/announcements', data),
  update: (id, data) => api.put(`/announcements/${id}`, data),
  delete: (id) => api.delete(`/announcements/${id}`),
};

export const reportAPI = {
  exportEmployees: (format) => api.get('/reports/employees', { params: { format }, responseType: 'blob' }),
  exportAttendance: (params) => api.get('/reports/attendance', { params: { ...params, responseType: 'blob' }, responseType: 'blob' }),
  exportLeaves: (params) => api.get('/reports/leaves', { params: { ...params, format: params.format || 'excel' }, responseType: 'blob' }),
  exportPayroll: (params) => api.get('/reports/payroll', { params: { ...params, format: params.format || 'excel' }, responseType: 'blob' }),
};

export const performanceAPI = {
  getAll: (params) => api.get('/performance-reviews', { params }),
  create: (data) => api.post('/performance-reviews', data),
  update: (id, data) => api.put(`/performance-reviews/${id}`, data),
  submit: (id) => api.patch(`/performance-reviews/${id}/submit`),
  acknowledge: (id) => api.patch(`/performance-reviews/${id}/acknowledge`),
};

export const documentAPI = {
  getAll: (params) => api.get('/documents', { params }),
  upload: (employeeId, formData) =>
    api.post(`/documents/${employeeId}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  verify: (id) => api.patch(`/documents/${id}/verify`),
  delete: (id) => api.delete(`/documents/${id}`),
};

export const auditAPI = {
  getLogs: (params) => api.get('/audit/logs', { params }),
  getActivities: (params) => api.get('/audit/activities', { params }),
};

export const shiftAPI = {
  getAll: (params) => api.get('/shifts', { params }),
  create: (data) => api.post('/shifts', data),
  update: (id, data) => api.put(`/shifts/${id}`, data),
  delete: (id) => api.delete(`/shifts/${id}`),
};
