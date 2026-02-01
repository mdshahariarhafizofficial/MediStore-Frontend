import axiosInstance from './axios';
import { ApiResponse, Medicine, Category, PaginatedResponse } from '@/lib/types';

export const medicineApi = {
  getAllMedicines: async (params?: {
    page?: string;
    limit?: string;
    category?: string;
    search?: string;
    minPrice?: string;
    maxPrice?: string;
    sortBy?: string;
    sortOrder?: string;
  }): Promise<ApiResponse<PaginatedResponse<Medicine>>> => {
    return axiosInstance.get('/medicines', { params });
  },

  getMedicineById: async (id: string): Promise<ApiResponse<Medicine>> => {
    return axiosInstance.get(`/medicines/${id}`);
  },

  getCategories: async (): Promise<ApiResponse<Category[]>> => {
    return axiosInstance.get('/medicines/categories');
  },
};