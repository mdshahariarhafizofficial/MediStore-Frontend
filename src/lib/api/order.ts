import axiosInstance from './axios';
import { ApiResponse, Order } from '@/lib/types';

export const orderApi = {
  createOrder: async (data: {
    items: Array<{ medicineId: string; quantity: number }>;
    shippingAddress: string;
    phone: string;
  }): Promise<ApiResponse<Order>> => {
    return axiosInstance.post('/orders', data);
  },

  getUserOrders: async (): Promise<ApiResponse<Order[]>> => {
    return axiosInstance.get('/orders');
  },

  getOrderById: async (id: string): Promise<ApiResponse<Order>> => {
    return axiosInstance.get(`/orders/${id}`);
  },

  addReview: async (medicineId: string, data: { rating: number; comment?: string }): Promise<ApiResponse> => {
    return axiosInstance.post(`/orders/${medicineId}/review`, data);
  },
};