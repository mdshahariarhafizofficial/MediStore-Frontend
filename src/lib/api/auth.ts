import axiosInstance from './axios';
import { AuthResponse, ApiResponse, User } from '@/lib/types';

export const authApi = {
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: 'CUSTOMER' | 'SELLER';
    phone?: string;
    address?: string;
  }): Promise<ApiResponse<AuthResponse>> => {
    return axiosInstance.post('/auth/register', data);
  },

  login: (data: { email: string; password: string }): Promise<ApiResponse<AuthResponse>> => {
    return axiosInstance.post('/auth/login', data);
  },

  getCurrentUser: (): Promise<ApiResponse<User>> => {
    return axiosInstance.get('/auth/me');
  },
};