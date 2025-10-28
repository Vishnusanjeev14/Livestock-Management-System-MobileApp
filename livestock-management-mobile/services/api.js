import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage'; // Import AsyncStorage

// This must be your computer's local IP address
const API_BASE_URL = 'http://192.168.29.183:5001/api';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// --- CORRECTED INTERCEPTORS ---
// Add auth token to requests
api.interceptors.request.use(async (config) => { // Make interceptor async
  try {
    const token = await AsyncStorage.getItem('token'); // Use AsyncStorage
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    console.error("Error retrieving token from AsyncStorage", e);
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Handle auth errors (logout if unauthorized)
api.interceptors.response.use(
  (response) => response,
  async (error) => { // Make interceptor async
    if (error.response?.status === 401) {
      try {
        await AsyncStorage.removeItem('token'); // Use AsyncStorage
        // In React Native, navigation is handled differently.
        // The AuthContext will detect the missing token on next load.
        console.log("Unauthorized, token removed.");
      } catch (e) {
        console.error("Error removing token from AsyncStorage", e);
      }
    }
    return Promise.reject(error);
  }
);
// --- END OF CORRECTIONS ---


// Auth API
export const authAPI = {
  signin: (email, password) => api.post('/auth/signin', { email, password }),
  signup: (userData) => api.post('/auth/signup', userData),
};

// Livestock API
export const livestockAPI = {
  getAll: () => api.get('/livestock'),
  getById: (id) => api.get(`/livestock/${id}`),
  create: (data) => api.post('/livestock', data),
  update: (id, data) => api.put(`/livestock/${id}`, data),
  delete: (id) => api.delete(`/livestock/${id}`),
};

// Breeding API
export const breedingAPI = {
  getAll: () => api.get('/breeding'),
  getById: (id) => api.get(`/breeding/${id}`),
  create: (data) => api.post('/breeding', data),
  update: (id, data) => api.put(`/breeding/${id}`, data),
  delete: (id) => api.delete(`/breeding/${id}`),
};

// Feeding API
export const feedingAPI = {
  getAll: () => api.get('/feeding'),
  getById: (id) => api.get(`/feeding/${id}`),
  create: (data) => api.post('/feeding', data),
  update: (id, data) => api.put(`/feeding/${id}`, data),
  delete: (id) => api.delete(`/feeding/${id}`),
};

// Health API
export const healthAPI = {
  getAll: () => api.get('/health'),
  getById: (id) => api.get(`/health/${id}`),
  create: (data) => api.post('/health', data),
  update: (id, data) => api.put(`/health/${id}`, data),
  delete: (id) => api.delete(`/health/${id}`),
};

// Production API
export const productionAPI = {
  getAll: () => api.get('/production'),
  getById: (id) => api.get(`/production/${id}`),
  create: (data) => api.post('/production', data),
  update: (id, data) => api.put(`/production/${id}`, data),
  delete: (id) => api.delete(`/production/${id}`),
};

// Veterinary API
export const veterinaryAPI = {
  getAll: () => api.get('/veterinary'),
  getById: (id) => api.get(`/veterinary/${id}`),
  create: (data) => api.post('/veterinary', data),
  update: (id, data) => api.put(`/veterinary/${id}`, data),
  delete: (id) => api.delete(`/veterinary/${id}`),
};

// Sales API
export const salesAPI = {
  getAnimalSales: () => api.get('/sales/animals'),
  createAnimalSale: (data) => api.post('/sales/animals', data),
  updateAnimalSale: (id, data) => api.put(`/sales/animals/${id}`, data),
  deleteAnimalSale: (id) => api.delete(`/sales/animals/${id}`),
  getProductSales: () => api.get('/sales/products'),
  createProductSale: (data) => api.post('/sales/products', data),
  updateProductSale: (id, data) => api.put(`/sales/products/${id}`, data),
  deleteProductSale: (id) => api.delete(`/sales/products/${id}`),
};

// Inventory API
export const inventoryAPI = {
  getAll: () => api.get('/inventory'),
  getById: (id) => api.get(`/inventory/${id}`),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
  getLowStock: () => api.get('/inventory/low-stock'),
};

// Finance API
export const financeAPI = {
  getExpenses: () => api.get('/finance/expenses'),
  createExpense: (data) => api.post('/finance/expenses', data),
  updateExpense: (id, data) => api.put(`/finance/expenses/${id}`, data),
  deleteExpense: (id) => api.delete(`/finance/expenses/${id}`),
  getIncome: () => api.get('/finance/income'),
  createIncome: (data) => api.post('/finance/income', data),
  updateIncome: (id, data) => api.put(`/finance/income/${id}`, data),
  deleteIncome: (id) => api.delete(`/finance/income/${id}`),
  getSummary: (startDate, endDate) => api.get('/finance/summary', { params: { startDate, endDate } }),
};

// Staff API
export const staffAPI = {
  getEmployees: () => api.get('/staff/employees'),
  createEmployee: (data) => api.post('/staff/employees', data),
  updateEmployee: (id, data) => api.put(`/staff/employees/${id}`, data),
  deleteEmployee: (id) => api.delete(`/staff/employees/${id}`),
  getTasks: () => api.get('/staff/tasks'),
  createTask: (data) => api.post('/staff/tasks', data),
  updateTask: (id, data) => api.put(`/staff/tasks/${id}`, data),
  deleteTask: (id) => api.delete(`/staff/tasks/${id}`),
  getAttendance: (startDate, endDate, employeeId) => api.get('/staff/attendance', { params: { startDate, endDate, employeeId } }),
  createAttendance: (data) => api.post('/staff/attendance', data),
  updateAttendance: (id, data) => api.put(`/staff/attendance/${id}`, data),
  deleteAttendance: (id) => api.delete(`/staff/attendance/${id}`),
};

// Environment API
export const environmentAPI = {
  getAll: () => api.get('/environment'),
  getById: (id) => api.get(`/environment/${id}`),
  create: (data) => api.post('/environment', data),
  update: (id, data) => api.put(`/environment/${id}`, data),
  delete: (id) => api.delete(`/environment/${id}`),
  getForecast: (city) => api.get(`/environment/forecast/${city}`),
  getCities: () => api.get('/environment/cities/list'),
};

// Scheduler API
export const schedulerAPI = {
  getAll: () => api.get('/scheduler'),
  getById: (id) => api.get(`/scheduler/${id}`),
  create: (data) => api.post('/scheduler', data),
  update: (id, data) => api.put(`/scheduler/${id}`, data),
  delete: (id) => api.delete(`/scheduler/${id}`),
  getUpcoming: () => api.get('/scheduler/upcoming/list'),
  markComplete: (id) => api.put(`/scheduler/${id}/complete`),
  getSummary: () => api.get('/scheduler/dashboard/summary'),
};

export default api;