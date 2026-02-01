'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ArrowLeft, MapPin, Phone, CreditCard, 
  Shield, Truck, Package, AlertCircle 
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { cartApi } from '@/lib/api/cart';
import { orderApi } from '@/lib/api/order';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';

const checkoutSchema = z.object({
  shippingAddress: z.string().min(10, 'Address must be at least 10 characters'),
  phone: z.string().min(10, 'Valid phone number is required'),
  paymentMethod: z.enum(['COD', 'CARD']),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { user } = useAuthStore();
  const { items, total, clearCart } = useCartStore();
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push('/cart');
    }
  }, [items, router]);

  // Fetch cart items
  const { data: cartData, isLoading } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.getCartItems(),
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      shippingAddress: user?.address || '',
      phone: user?.phone || '',
      paymentMethod: 'COD',
    },
  });

  const paymentMethod = watch('paymentMethod');

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: (data: CheckoutFormData) =>
      orderApi.createOrder({
        items: items.map(item => ({
          medicineId: item.medicineId,
          quantity: item.quantity,
        })),
        shippingAddress: data.shippingAddress,
        phone: data.phone,
      }),
    onSuccess: (response) => {
      if (response.success) {
        clearCart();
        toast.success('Order placed successfully!');
        router.push(`/orders/${response.data.id}`);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to place order');
    },
    onSettled: () => {
      setIsProcessing(false);
    },
  });

  const onSubmit = async (data: CheckoutFormData) => {
    setIsProcessing(true);
    createOrderMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading checkout..." />
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-6">Add some medicines to proceed to checkout</p>
          <Button onClick={() => router.push('/shop')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <button
            onClick={() => router.push('/cart')}
            className="flex items-center text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Cart
          </button>
          <h1 className="text-3xl font-bold text-gray-900 mt-4">Checkout</h1>
          <p className="text-gray-600">Complete your order in just a few steps</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Form */}
            <div className="lg:col-span-2">
              {/* Shipping Information */}
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mr-4">
                    <MapPin className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Shipping Information</h2>
                    <p className="text-gray-600">Where should we deliver your order?</p>
                  </div>
                </div>

                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Shipping Address
                    </label>
                    <textarea
                      {...register('shippingAddress')}
                      rows={4}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.shippingAddress ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your complete address including apartment number, street, city, and postal code"
                    />
                    {errors.shippingAddress && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.shippingAddress.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        {...register('phone')}
                        className={`w-full px-4 py-3 pl-12 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                          errors.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="+880 1234 567890"
                      />
                      <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    </div>
                    {errors.phone && (
                      <p className="mt-2 text-sm text-red-600 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-1" />
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Delivery Notes (Optional)
                    </label>
                    <textarea
                      {...register('notes')}
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="Any special instructions for delivery?"
                    />
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="bg-white rounded-2xl shadow-sm p-6">
                <div className="flex items-center mb-6">
                  <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center mr-4">
                    <CreditCard className="h-5 w-5 text-primary-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">Payment Method</h2>
                    <p className="text-gray-600">How would you like to pay?</p>
                  </div>
                </div>

                <div className="space-y-4">
                  {[
                    { value: 'COD', label: 'Cash on Delivery', description: 'Pay when you receive your order' },
                    { value: 'CARD', label: 'Credit/Debit Card', description: 'Pay securely online', disabled: true },
                  ].map((method) => (
                    <label
                      key={method.value}
                      className={`flex items-center p-4 rounded-xl border cursor-pointer transition-all ${
                        paymentMethod === method.value
                          ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500 ring-opacity-20'
                          : 'border-gray-300 hover:border-gray-400'
                      } ${method.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <input
                        type="radio"
                        value={method.value}
                        disabled={method.disabled}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                        {...register('paymentMethod')}
                      />
                      <div className="ml-4">
                        <div className="flex items-center">
                          <span className="font-medium text-gray-900">{method.label}</span>
                          {method.disabled && (
                            <span className="ml-2 px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
                              Coming Soon
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">{method.description}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* Payment Security */}
                <div className="mt-8 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">Secure Payment</p>
                      <p className="text-xs text-gray-500">
                        Your payment information is encrypted and secure
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

                {/* Items List */}
                <div className="space-y-4 mb-6">
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 line-clamp-1">
                          {item.medicine.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {item.quantity} × ৳{item.medicine.price}
                        </p>
                      </div>
                      <p className="font-medium text-gray-900">
                        ৳{(item.medicine.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Order Total */}
                <div className="border-t border-gray-200 pt-4 space-y-3 mb-6">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>৳{total?.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Shipping</span>
                    <span className="text-green-600">Free</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax</span>
                    <span>৳0.00</span>
                  </div>
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex justify-between text-xl font-bold text-gray-900">
                      <span>Total</span>
                      <span>৳{total?.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Delivery Estimate */}
                <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <Truck className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">Estimated Delivery</p>
                      <p className="text-sm text-gray-600">
                        2-4 hours in metro cities
                      </p>
                    </div>
                  </div>
                </div>

                {/* Place Order Button */}
                <Button
                  type="submit"
                  loading={isProcessing || createOrderMutation.isPending}
                  size="lg"
                  className="w-full"
                >
                  Place Order
                </Button>

                {/* Terms */}
                <p className="text-xs text-gray-500 text-center mt-4">
                  By placing your order, you agree to our{' '}
                  <a href="/terms" className="text-primary-600 hover:text-primary-700">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-primary-600 hover:text-primary-700">
                    Privacy Policy
                  </a>
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}