import axios from 'axios';
import toast from 'react-hot-toast';

const isDev = process.env.NODE_ENV === 'development';
const API_URL = isDev ? 'http://localhost:5000/api' : (process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api');

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // increased timeout for cold-start production servers
});

// Request interceptor
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('medistore_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
axiosInstance.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    
    const isNetworkError = error.message === 'Network Error' || !error.response;
    
    if (isNetworkError) {
      toast.error('Unable to connect to the server. Please check your internet or try again in a moment (Servers may be waking up).', { id: 'network-err' });
      return Promise.reject({ message: 'Network connection failed' });
    }

    if (error.response?.status === 401) {
      localStorage.removeItem('medistore_token');
      localStorage.removeItem('medistore_user');
      toast.error('Session expired. Please login again.', { id: 'auth-err' });
      if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    
    const message = error.response?.data?.message || 
                   error.message || 
                   'Something went wrong. Please try again.';
    
    // Specifically don't broadcast standard validation or 404 fetching as global red toasts aggressively
    if (error.response?.status >= 500) {
      toast.error(message, { id: 'svr-err' });
    }
    
    return Promise.reject(error.response?.data || error);
  }
);

export default axiosInstance;