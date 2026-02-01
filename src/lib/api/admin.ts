import axiosInstance from './axios';
import { User, Order, Medicine, Category, ApiResponse } from '@/lib/types';

export const adminApi = {
  getUsers: (): Promise<ApiResponse<User[]>> => {
    return axiosInstance.get('/admin/users');
  },

  updateUserStatus: (id: string, isActive: boolean): Promise<ApiResponse> => {
    return axiosInstance.patch(`/admin/users/${id}/status`, { isActive });
  },

  getOrders: (): Promise<ApiResponse<Order[]>> => {
    return axiosInstance.get('/admin/orders');
  },

  getMedicines: (): Promise<ApiResponse<Medicine[]>> => {
    return axiosInstance.get('/admin/medicines');
  },

  deleteMedicine: (id: string): Promise<ApiResponse> => {
    return axiosInstance.delete(`/admin/medicines/${id}`);
  },

  getCategories: (): Promise<ApiResponse<Category[]>> => {
    return axiosInstance.get('/admin/categories');
  },

  createCategory: (data: { name: string; description?: string }): Promise<ApiResponse<Category>> => {
    return axiosInstance.post('/admin/categories', data);
  },

  updateCategory: (id: string, data: { name: string; description?: string }): Promise<ApiResponse<Category>> => {
    return axiosInstance.put(`/admin/categories/${id}`, data);
  },

  deleteCategory: (id: string): Promise<ApiResponse> => {
    return axiosInstance.delete(`/admin/categories/${id}`);
  },
};