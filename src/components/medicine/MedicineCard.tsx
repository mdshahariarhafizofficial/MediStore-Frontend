'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Package, Heart } from 'lucide-react';
import { Medicine } from '@/lib/types';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth.store';
import { cartApi } from '@/lib/api/cart';
import { useCartStore } from '@/store/cart.store';
import toast from 'react-hot-toast';

interface MedicineCardProps {
  medicine: Medicine;
}

const MedicineCard: React.FC<MedicineCardProps> = ({ medicine }) => {
  const { user, isAuthenticated } = useAuthStore();
  const { addItem } = useCartStore();
  const [isAdding, setIsAdding] = React.useState(false);

  const handleAddToCart = async () => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER') {
      toast.error('Please login as a customer to add items to cart');
      return;
    }

    setIsAdding(true);
    try {
      const response = await cartApi.addToCart({
        medicineId: medicine.id,
        quantity: 1,
      });

      if (response.success) {
        addItem(response.data!);
        toast.success('Added to cart successfully!');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add to cart');
    } finally {
      setIsAdding(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
    }).format(price);
  };

  return (
    <div className="group bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300">
      {/* Image Section */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <Link href={`/shop/${medicine.id}`}>
          {medicine.imageUrl ? (
            <Image
              src={medicine.imageUrl}
              alt={medicine.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <Package className="h-16 w-16 text-gray-400" />
            </div>
          )}
        </Link>
        
        {/* Stock Badge */}
        {medicine.stock === 0 ? (
          <div className="absolute top-3 right-3 bg-error-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Out of Stock
          </div>
        ) : medicine.stock < 10 ? (
          <div className="absolute top-3 right-3 bg-warning-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            Low Stock
          </div>
        ) : (
          <div className="absolute top-3 right-3 bg-success-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
            In Stock
          </div>
        )}
        
        {/* Wishlist Button */}
        <button className="absolute top-3 left-3 p-2 bg-white/90 rounded-full hover:bg-white transition-colors">
          <Heart className="h-4 w-4 text-gray-600" />
        </button>
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Category & Rating */}
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-primary-600 bg-primary-50 px-2 py-1 rounded">
            {medicine.category?.name || 'Medicine'}
          </span>
          <div className="flex items-center space-x-1">
            <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />
            <span className="text-sm font-medium text-gray-700">
              {medicine.averageRating?.toFixed(1) || '0.0'}
            </span>
            <span className="text-xs text-gray-500">
              ({medicine.reviewCount || 0})
            </span>
          </div>
        </div>

        {/* Medicine Name */}
        <Link href={`/shop/${medicine.id}`}>
          <h3 className="font-semibold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1 mb-1">
            {medicine.name}
          </h3>
        </Link>

        {/* Manufacturer */}
        <p className="text-sm text-gray-500 mb-3">By {medicine.manufacturer}</p>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {medicine.description}
        </p>

        {/* Price & Action */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(medicine.price)}
            </p>
            <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
              <Package className="h-3 w-3" />
              <span>{medicine.stock} units available</span>
            </div>
          </div>

          <div className="flex space-x-2">
            <Link href={`/shop/${medicine.id}`}>
              <Button variant="outline" size="sm">
                View
              </Button>
            </Link>
            {medicine.stock > 0 && (
              <Button
                variant="primary"
                size="sm"
                loading={isAdding}
                onClick={handleAddToCart}
                className="flex items-center space-x-1.5"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Add</span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineCard;