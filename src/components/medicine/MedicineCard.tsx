'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Star, ShoppingCart, Package } from 'lucide-react';
import { Medicine } from '@/lib/types';
import Button from '@/components/ui/Button';

interface MedicineCardProps {
  medicine: Medicine;
}

const MedicineCard: React.FC<MedicineCardProps> = ({ medicine }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative h-48 bg-gray-100">
        {medicine.imageUrl ? (
          <Image
            src={medicine.imageUrl}
            alt={medicine.name}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <Package className="h-12 w-12 text-gray-400" />
          </div>
        )}
        {medicine.stock === 0 && (
          <div className="absolute inset-0 bg-red-500/10 flex items-center justify-center">
            <span className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Link href={`/shop/${medicine.id}`} className="hover:text-primary-600">
            <h3 className="font-semibold text-lg line-clamp-1">{medicine.name}</h3>
          </Link>
          <span className="bg-primary-100 text-primary-800 text-xs px-2 py-1 rounded-full">
            {medicine.category?.name}
          </span>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{medicine.description}</p>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm font-medium">
              {medicine.averageRating?.toFixed(1) || '0.0'}
            </span>
            <span className="text-gray-500 text-sm">
              ({medicine.reviewCount || 0})
            </span>
          </div>
          <div className="flex items-center space-x-1 text-gray-500 text-sm">
            <Package className="h-4 w-4" />
            <span>{medicine.stock} in stock</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <p className="text-2xl font-bold text-primary-700">
              ৳{medicine.price.toFixed(2)}
            </p>
            <p className="text-gray-500 text-sm">By {medicine.manufacturer}</p>
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
                className="flex items-center space-x-1"
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