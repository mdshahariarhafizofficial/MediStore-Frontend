import axiosInstance from './axios';
import { ApiResponse, User, Order, Category } from '@/lib/types';

export const adminApi = {
  getUsers: async (): Promise<ApiResponse<User[]>> => {
    return axiosInstance.get('/admin/users');
  },

  updateUserStatus: async (id: string, data: { isActive: boolean }): Promise<ApiResponse<User>> => {
    return axiosInstance.patch(`/admin/users/${id}/status`, data);
  },

  getOrders: async (): Promise<ApiResponse<Order[]>> => {
    return axiosInstance.get('/admin/orders');
  },

  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    return axiosInstance.get('/admin/categories');
  },

  createCategory: async (data: { name: string; description?: string }): Promise<ApiResponse<Category>> => {
    return axiosInstance.post('/admin/categories', data);
  },

  updateCategory: async (id: string, data: { name: string; description?: string }): Promise<ApiResponse<Category>> => {
    return axiosInstance.put(`/admin/categories/${id}`, data);
  },

  deleteCategory: async (id: string): Promise<ApiResponse> => {
    return axiosInstance.delete(`/admin/categories/${id}`);
  },
};