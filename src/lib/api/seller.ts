import axiosInstance from './axios';
import { Medicine, Order, ApiResponse } from '@/lib/types';

export const sellerApi = {
  getMedicines: (): Promise<ApiResponse<Medicine[]>> => {
    return axiosInstance.get('/seller/medicines');
  },

  addMedicine: (data: any): Promise<ApiResponse<Medicine>> => {
    return axiosInstance.post('/seller/medicines', data);
  },

  updateMedicine: (id: string, data: any): Promise<ApiResponse<Medicine>> => {
    return axiosInstance.put(`/seller/medicines/${id}`, data);
  },

  deleteMedicine: (id: string): Promise<ApiResponse> => {
    return axiosInstance.delete(`/seller/medicines/${id}`);
  },

  getOrders: (): Promise<ApiResponse<Order[]>> => {
    return axiosInstance.get('/seller/orders');
  },

  updateOrderStatus: (id: string, status: string): Promise<ApiResponse> => {
    return axiosInstance.patch(`/seller/orders/${id}/status`, { status });
  },
};