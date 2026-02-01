import axiosInstance from './axios';
import { ApiResponse, CartItem } from '@/lib/types';

export const cartApi = {
  getCartItems: async (): Promise<ApiResponse<{ items: CartItem[]; total: number; itemCount: number }>> => {
    return axiosInstance.get('/cart');
  },

  addToCart: async (data: { medicineId: string; quantity?: number }): Promise<ApiResponse<CartItem>> => {
    return axiosInstance.post('/cart', data);
  },

  updateCartItem: async (id: string, data: { quantity: number }): Promise<ApiResponse<CartItem>> => {
    return axiosInstance.put(`/cart/${id}`, data);
  },

  removeCartItem: async (id: string): Promise<ApiResponse> => {
    return axiosInstance.delete(`/cart/${id}`);
  },

  clearCart: async (): Promise<ApiResponse> => {
    return axiosInstance.delete('/cart');
  },
};