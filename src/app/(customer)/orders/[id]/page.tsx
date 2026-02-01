'use client';

import React, { useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Package, CheckCircle, Clock, 
  Truck, MapPin, Phone, CreditCard, 
  Printer, Download, AlertCircle 
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { orderApi } from '@/lib/api/order';
import { useAuthStore } from '@/store/auth.store';
import { Order, OrderStatus } from '@/lib/types';

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const orderId = params.id as string;

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  // Fetch order details
  const { data: orderData, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApi.getOrderById(orderId),
    enabled: !!orderId && isAuthenticated && user?.role === 'CUSTOMER',
  });

  const order = orderData?.data;

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case 'PLACED': return 'bg-blue-100 text-blue-800';
      case 'PROCESSING': return 'bg-yellow-100 text-yellow-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: OrderStatus) => {
    switch (status) {
      case 'PLACED': return Package;
      case 'PROCESSING': return Clock;
      case 'SHIPPED': return Truck;
      case 'DELIVERED': return CheckCircle;
      case 'CANCELLED': return AlertCircle;
      default: return Package;
    }
  };

  const getStatusSteps = (status: OrderStatus) => {
    const steps = [
      { key: 'PLACED', label: 'Order Placed', completed: true },
      { key: 'PROCESSING', label: 'Processing', completed: ['PROCESSING', 'SHIPPED', 'DELIVERED'].includes(status) },
      { key: 'SHIPPED', label: 'Shipped', completed: ['SHIPPED', 'DELIVERED'].includes(status) },
      { key: 'DELIVERED', label: 'Delivered', completed: status === 'DELIVERED' },
    ];
    
    if (status === 'CANCELLED') {
      return steps.map(step => ({ ...step, completed: false }));
    }
    
    return steps;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-BD', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadInvoice = () => {
    toast.success('Invoice download started');
    // In a real app, this would generate and download a PDF invoice
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading order details..." />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Order Not Found</h2>
          <p className="text-gray-600 mb-6">The order you're looking for doesn't exist or you don't have access to it.</p>
          <Link href="/orders">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Orders
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const StatusIcon = getStatusIcon(order.status);
  const statusColor = getStatusColor(order.status);
  const statusSteps = getStatusSteps(order.status);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Link href="/orders" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Orders
          </Link>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Order #{order.orderNumber}</h1>
              <p className="text-gray-600 mt-2">
                Placed on {formatDate(order.createdAt)}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={handlePrint}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Printer className="h-4 w-4 mr-2" />
                Print
              </button>
              <button
                onClick={handleDownloadInvoice}
                className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Invoice
              </button>
            </div>
          </div>
        </div>

        {/* Order Status Card */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-3">
              <div className={`p-3 rounded-lg ${statusColor}`}>
                <StatusIcon className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">Order Status</h2>
                <p className="text-gray-600">Track your order progress</p>
              </div>
            </div>
            <span className={`px-4 py-2 rounded-full font-medium ${statusColor}`}>
              {order.status}
            </span>
          </div>

          {/* Status Steps */}
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-0.5 bg-gray-200"></div>
            <div className="relative flex justify-between">
              {statusSteps.map((step, index) => (
                <div key={step.key} className="flex flex-col items-center relative z-10">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-3 ${
                    step.completed ? 'bg-primary-600 text-white' : 'bg-gray-200 text-gray-400'
                  }`}>
                    {step.completed ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-medium">{index + 1}</span>
                    )}
                  </div>
                  <span className={`text-sm font-medium ${
                    step.completed ? 'text-gray-900' : 'text-gray-500'
                  }`}>
                    {step.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Order Details */}
          <div className="lg:col-span-2">
            {/* Order Items */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Items</h2>
              <div className="space-y-6">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-center justify-between pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                    <div className="flex items-center space-x-4">
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {item.medicine.imageUrl ? (
                          <img
                            src={item.medicine.imageUrl}
                            alt={item.medicine.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <Link
                          href={`/shop/${item.medicine.id}`}
                          className="font-semibold text-gray-900 hover:text-primary-600"
                        >
                          {item.medicine.name}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          {item.medicine.manufacturer}
                        </p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Shipping Information */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Shipping Information</h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-4">
                      <MapPin className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Shipping Address</p>
                      <p className="text-sm text-gray-500">Where we delivered</p>
                    </div>
                  </div>
                  <p className="text-gray-600 whitespace-pre-line">{order.shippingAddress}</p>
                </div>

                <div>
                  <div className="flex items-center mb-4">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mr-4">
                      <Phone className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Contact Information</p>
                      <p className="text-sm text-gray-500">Phone number</p>
                    </div>
                  </div>
                  <p className="text-gray-600">{order.phone}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrice(order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0))}</span>
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
                    <span>{formatPrice(order.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Information */}
              <div className="border-t border-gray-200 pt-6 mb-6">
                <div className="flex items-center mb-4">
                  <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mr-4">
                    <CreditCard className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Payment Method</p>
                    <p className="text-sm text-gray-500">How you paid</p>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{order.paymentMethod}</span>
                    <span className="text-green-600 font-medium">Paid</span>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    {order.paymentMethod === 'COD' 
                      ? 'Paid upon delivery' 
                      : 'Paid online via card'}
                  </p>
                </div>
              </div>

              {/* Order Information */}
              <div className="border-t border-gray-200 pt-6">
                <h3 className="font-medium text-gray-900 mb-4">Order Information</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Order Number</span>
                    <span className="font-medium">{order.orderNumber}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Order Date</span>
                    <span className="font-medium">{formatDate(order.createdAt)}</span>
                  </div>
                  {order.updatedAt !== order.createdAt && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Last Updated</span>
                      <span className="font-medium">{formatDate(order.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Actions */}
              {/* {order.status === 'DELIVERED' && (
                <div className="mt-6">
                  <Button variant="primary" className="w-full">
                    Write a Review
                  </Button>
                </div>
              )} */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}