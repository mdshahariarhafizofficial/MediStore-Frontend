import axiosInstance from './axios';
import { ApiResponse, Medicine, Order } from '@/lib/types';

export const sellerApi = {
  getMedicines: async (): Promise<ApiResponse<Medicine[]>> => {
    return axiosInstance.get('/seller/medicines');
  },

  addMedicine: async (data: any): Promise<ApiResponse<Medicine>> => {
    return axiosInstance.post('/seller/medicines', data);
  },

  updateMedicine: async (id: string, data: any): Promise<ApiResponse<Medicine>> => {
    return axiosInstance.put(`/seller/medicines/${id}`, data);
  },

  deleteMedicine: async (id: string): Promise<ApiResponse> => {
    return axiosInstance.delete(`/seller/medicines/${id}`);
  },

  getOrders: async (): Promise<ApiResponse<Order[]>> => {
    return axiosInstance.get('/seller/orders');
  },

  updateOrderStatus: async (id: string, data: { status: string }): Promise<ApiResponse<Order>> => {
    return axiosInstance.patch(`/seller/orders/${id}/status`, data);
  },
};