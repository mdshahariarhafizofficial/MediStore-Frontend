import axiosInstance from './axios';
import { Medicine, Category, PaginatedResponse, ApiResponse } from '@/lib/types';

export const medicineApi = {
  getAllMedicines: (params?: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    minPrice?: number;
    maxPrice?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ApiResponse<PaginatedResponse<Medicine>>> => {
    return axiosInstance.get('/medicines', { params });
  },

  getMedicineById: (id: string): Promise<ApiResponse<Medicine>> => {
    return axiosInstance.get(`/medicines/${id}`);
  },

  getCategories: (): Promise<ApiResponse<Category[]>> => {
    return axiosInstance.get('/medicines/categories');
  },
};