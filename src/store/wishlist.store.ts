import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Medicine } from '@/lib/types';

interface WishlistState {
  items: Medicine[];
  addToWishlist: (medicine: Medicine) => void;
  removeFromWishlist: (medicineId: string) => void;
  isInWishlist: (medicineId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      addToWishlist: (medicine) =>
        set((state) => {
          if (state.items.find(item => item.id === medicine.id)) {
            return state;
          }
          return { items: [...state.items, medicine] };
        }),
      removeFromWishlist: (medicineId) =>
        set((state) => ({
          items: state.items.filter(item => item.id !== medicineId),
        })),
      isInWishlist: (medicineId) => {
        return get().items.some(item => item.id === medicineId);
      },
      clearWishlist: () => set({ items: [] }),
    }),
    {
      name: 'medistore-wishlist',
    }
  )
);