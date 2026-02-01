import axiosInstance from './axios';
import { Order, ApiResponse } from '@/lib/types';

export const orderApi = {
  createOrder: (data: {
    items: Array<{ medicineId: string; quantity: number }>;
    shippingAddress: string;
    phone: string;
  }): Promise<ApiResponse<Order>> => {
    return axiosInstance.post('/orders', data);
  },

  getOrders: (): Promise<ApiResponse<Order[]>> => {
    return axiosInstance.get('/orders');
  },

  getOrderById: (id: string): Promise<ApiResponse<Order>> => {
    return axiosInstance.get(`/orders/${id}`);
  },

  addReview: (medicineId: string, data: { rating: number; comment?: string }): Promise<ApiResponse> => {
    return axiosInstance.post(`/orders/${medicineId}/review`, data);
  },
};