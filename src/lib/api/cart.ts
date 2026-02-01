import axiosInstance from './axios';
import { CartItem, ApiResponse } from '@/lib/types';

export const cartApi = {
  getCart: (): Promise<ApiResponse<{ items: CartItem[]; total: number; itemCount: number }>> => {
    return axiosInstance.get('/cart');
  },

  addToCart: (data: { medicineId: string; quantity: number }): Promise<ApiResponse<CartItem>> => {
    return axiosInstance.post('/cart', data);
  },

  updateCartItem: (id: string, quantity: number): Promise<ApiResponse<CartItem>> => {
    return axiosInstance.put(`/cart/${id}`, { quantity });
  },

  removeFromCart: (id: string): Promise<ApiResponse> => {
    return axiosInstance.delete(`/cart/${id}`);
  },

  clearCart: (): Promise<ApiResponse> => {
    return axiosInstance.delete('/cart');
  },
};