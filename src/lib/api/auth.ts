import axiosInstance from './axios';
import { AuthResponse, ApiResponse, User } from '@/lib/types';

export const authApi = {
  register: async (data: {
    name: string;
    email: string;
    password: string;
    role: 'CUSTOMER' | 'SELLER';
    phone?: string;
    address?: string;
  }): Promise<ApiResponse<AuthResponse>> => {
    return axiosInstance.post('/auth/register', data);
  },

  login: async (data: { email: string; password: string }): Promise<ApiResponse<AuthResponse>> => {
    return axiosInstance.post('/auth/login', data);
  },

  getCurrentUser: async (): Promise<ApiResponse<User>> => {
    return axiosInstance.get('/auth/me');
  },
  
  logout: () => {
    localStorage.removeItem('medistore_token');
    localStorage.removeItem('medistore_user');
    window.location.href = '/login';
  },
};