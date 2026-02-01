'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ShoppingCart, Trash2, Plus, Minus, ArrowRight } from 'lucide-react';
import { cartApi } from '@/lib/api/cart';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useCartStore } from '@/store/cart.store';

export default function CartPage() {
  const { items, total, itemCount, setCart, removeItem, updateItem } = useCartStore();

  const { isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    onSuccess: (data) => {
      if (data.success && data.data) {
        setCart(data.data.items, data.data.total, data.data.itemCount);
      }
    },
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Shopping Cart</h1>
          <p className="text-gray-600 mt-2">
            {itemCount} {itemCount === 1 ? 'item' : 'items'} in your cart
          </p>
        </div>

        {itemCount === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
            <p className="text-gray-600 mb-6">
              Looks like you haven't added any medicines to your cart yet.
            </p>
            <Link href="/shop">
              <Button size="lg">
                Browse Medicines
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        ) : (
          <div className="lg:grid lg:grid-cols-3 lg:gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <div className="bg-white rounded-xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h2 className="text-lg font-semibold">Cart Items</h2>
                </div>

                <div className="divide-y divide-gray-200">
                  {items.map((item) => (
                    <div key={item.id} className="p-6">
                      <div className="flex">
                        <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden">
                          <div className="w-full h-full bg-gray-200" />
                        </div>

                        <div className="ml-6 flex-1">
                          <div className="flex justify-between">
                            <div>
                              <h3 className="text-lg font-medium text-gray-900">
                                {item.medicine.name}
                              </h3>
                              <p className="text-sm text-gray-500 mt-1">
                                {item.medicine.manufacturer}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-primary-700">
                                ৳{(item.medicine.price * item.quantity).toFixed(2)}
                              </p>
                              <p className="text-sm text-gray-500">
                                ৳{item.medicine.price.toFixed(2)} each
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 flex items-center justify-between">
                            <div className="flex items-center border border-gray-300 rounded-lg">
                              <button
                                onClick={() => updateItem(item.id, item.quantity - 1)}
                                className="p-2 hover:bg-gray-100"
                                disabled={item.quantity <= 1}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="px-4 py-2">{item.quantity}</span>
                              <button
                                onClick={() => updateItem(item.id, item.quantity + 1)}
                                className="p-2 hover:bg-gray-100"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>

                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-red-600 hover:text-red-700 flex items-center"
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Order Summary */}
            <div>
              <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
                <h2 className="text-lg font-semibold mb-4">Order Summary</h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">৳{total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Shipping</span>
                    <span className="font-medium">৳50.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">৳{(total * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total</span>
                      <span>৳{(total + 50 + total * 0.05).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Link href="/checkout">
                    <Button fullWidth size="lg">
                      Proceed to Checkout
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link href="/shop">
                    <Button variant="outline" fullWidth>
                      Continue Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}