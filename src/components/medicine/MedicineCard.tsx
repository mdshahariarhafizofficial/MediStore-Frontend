'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Package, Heart, Shield, Truck } from 'lucide-react';
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
  const [isWishlisted, setIsWishlisted] = React.useState(false);

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

  const handleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    toast.success(isWishlisted ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getStockStatus = () => {
    if (medicine.stock === 0) return { text: 'Out of Stock', color: 'bg-red-100 text-red-800' };
    if (medicine.stock < 10) return { text: 'Low Stock', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'In Stock', color: 'bg-green-100 text-green-800' };
  };

  const stockStatus = getStockStatus();

  return (
    <div className="group bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
      {/* Image Section */}
      <div className="relative h-56 bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
        <Link href={`/shop/${medicine.id}`}>
          <div className="relative w-full h-full">
            {medicine.imageUrl ? (
              <Image
                src={medicine.imageUrl}
                alt={medicine.name}
                fill
                className="object-cover group-hover:scale-110 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-6">
                <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center mb-4">
                  <Package className="h-10 w-10 text-white" />
                </div>
                <p className="text-sm text-gray-500 text-center">Medicine Image</p>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </Link>
        
        {/* Stock Badge */}
        <div className={`absolute top-4 right-4 px-3 py-1.5 rounded-full text-xs font-semibold ${stockStatus.color}`}>
          {stockStatus.text}
        </div>
        
        {/* Wishlist Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-4 left-4 p-2.5 bg-white/90 backdrop-blur-sm rounded-full hover:bg-white transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          <Heart className={`h-4 w-4 ${isWishlisted ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} />
        </button>

        {/* Quick View Overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex justify-center space-x-2">
            <Link href={`/shop/${medicine.id}`}>
              <Button size="sm" variant="primary" className="text-black bg-white hover:text-white hover:bg-gray-100">
                Quick View
              </Button>
            </Link>
            {medicine.stock > 0 && (
              <Button
                size="sm"
                variant="primary"
                loading={isAdding}
                onClick={handleAddToCart}
                className="flex items-center space-x-1.5"
              >
                <ShoppingCart className="h-4 w-4" />
                <span>Add to Cart</span>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Category */}
        <div className="mb-3">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
            {medicine.category?.name || 'Medicine'}
          </span>
        </div>

        {/* Medicine Name */}
        <Link href={`/shop/${medicine.id}`}>
          <h3 className="font-bold text-gray-900 hover:text-primary-600 transition-colors line-clamp-1 mb-2 text-lg">
            {medicine.name}
          </h3>
        </Link>

        {/* Manufacturer */}
        <div className="flex items-center text-sm text-gray-500 mb-3">
          <Shield className="h-3.5 w-3.5 mr-1.5" />
          <span>By {medicine.manufacturer}</span>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
          {medicine.description}
        </p>

        {/* Rating */}
        <div className="flex items-center mb-4">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < Math.round(medicine.averageRating || 0)
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="ml-2 text-sm font-medium text-gray-700">
            {medicine.averageRating?.toFixed(1) || '0.0'}
          </span>
          <span className="mx-1 text-gray-400">•</span>
          <span className="text-sm text-gray-500">
            {medicine.reviewCount || 0} reviews
          </span>
        </div>

        {/* Price & Action */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div>
            <p className="text-2xl font-bold text-gray-900">
              {formatPrice(medicine.price)}
            </p>
            <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
              <Truck className="h-3 w-3" />
              <span>Delivery in 2-4 hours</span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-1 text-sm text-gray-600">
              <Package className="h-4 w-4" />
              <span>{medicine.stock} units</span>
            </div>
            {medicine.stock > 0 && (
              <Button
                variant="primary"
                size="sm"
                loading={isAdding}
                onClick={handleAddToCart}
                className="px-4 py-2 rounded-lg shadow-md hover:shadow-lg"
              >
                <ShoppingCart className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicineCard;