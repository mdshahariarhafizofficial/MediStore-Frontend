import { create } from 'zustand';
import { CartItem } from '@/lib/types';

interface CartState {
  items: CartItem[];
  total: number;
  itemCount: number;
  setCart: (items: CartItem[], total: number, itemCount: number) => void;
  addItem: (item: CartItem) => void;
  updateItem: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  total: 0,
  itemCount: 0,
  setCart: (items, total, itemCount) => set({ items, total, itemCount }),
  addItem: (item) =>
    set((state) => ({
      items: [...state.items, item],
      itemCount: state.itemCount + 1,
      total: state.total + item.medicine.price * item.quantity,
    })),
  updateItem: (id, quantity) =>
    set((state) => {
      const itemIndex = state.items.findIndex((item) => item.id === id);
      if (itemIndex === -1) return state;

      const oldItem = state.items[itemIndex];
      const newItems = [...state.items];
      newItems[itemIndex] = { ...oldItem, quantity };

      const newTotal = newItems.reduce(
        (sum, item) => sum + item.medicine.price * item.quantity,
        0
      );

      return {
        items: newItems,
        total: newTotal,
        itemCount: newItems.length,
      };
    }),
  removeItem: (id) =>
    set((state) => {
      const item = state.items.find((item) => item.id === id);
      if (!item) return state;

      const newItems = state.items.filter((item) => item.id !== id);
      const newTotal = newItems.reduce(
        (sum, item) => sum + item.medicine.price * item.quantity,
        0
      );

      return {
        items: newItems,
        total: newTotal,
        itemCount: newItems.length,
      };
    }),
  clearCart: () => set({ items: [], total: 0, itemCount: 0 }),
}));