import { create } from 'zustand';
import { persist } from 'zustand/middleware';
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

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      total: 0,
      itemCount: 0,
      setCart: (items, total, itemCount) => set({ items, total, itemCount }),
      addItem: (item) =>
        set((state) => {
          const existingItem = state.items.find((i) => i.id === item.id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === item.id ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
              total: state.total + (item.medicine.price * item.quantity),
              itemCount: state.itemCount + item.quantity,
            };
          }
          return {
            items: [...state.items, item],
            total: state.total + (item.medicine.price * item.quantity),
            itemCount: state.itemCount + item.quantity,
          };
        }),
      updateItem: (id, quantity) =>
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (!item) return state;

          const quantityDiff = quantity - item.quantity;
          return {
            items: state.items.map((i) =>
              i.id === id ? { ...i, quantity } : i
            ),
            total: state.total + (item.medicine.price * quantityDiff),
            itemCount: state.itemCount + quantityDiff,
          };
        }),
      removeItem: (id) =>
        set((state) => {
          const item = state.items.find((i) => i.id === id);
          if (!item) return state;

          return {
            items: state.items.filter((i) => i.id !== id),
            total: state.total - (item.medicine.price * item.quantity),
            itemCount: state.itemCount - item.quantity,
          };
        }),
      clearCart: () => set({ items: [], total: 0, itemCount: 0 }),
    }),
    {
      name: 'medistore-cart',
    }
  )
);