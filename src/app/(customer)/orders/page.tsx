'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, CheckCircle, Clock, Truck, 
  XCircle, AlertCircle, Search, Filter,
  Star, MessageSquare, AlertTriangle, RefreshCw,
  ShoppingBag
} from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { orderApi } from '@/lib/api/order';
import { useAuthStore } from '@/store/auth.store';
import { Order, OrderStatus } from '@/lib/types';
import toast from 'react-hot-toast';

export default function OrdersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'ALL'>('ALL');
  const [selectedMedicine, setSelectedMedicine] = useState<any>(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [orderToCancel, setOrderToCancel] = useState<Order | null>(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Redirect if not authenticated
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'CUSTOMER') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  // Fetch orders with proper configuration
  const { 
    data: ordersData, 
    isLoading, 
    refetch,
    isRefetching,
    isFetching
  } = useQuery({
    queryKey: ['orders', user?.id],
    queryFn: () => orderApi.getUserOrders(),
    enabled: isAuthenticated && user?.role === 'CUSTOMER',
    staleTime: 0,
    cacheTime: 5 * 60 * 1000,
    refetchOnWindowFocus: true,
    refetchOnMount: true,
    refetchOnReconnect: true,
  });

  const orders = ordersData?.data || [];

  const handleWriteReview = (medicine: any) => {
    setSelectedMedicine(medicine);
    setIsReviewModalOpen(true);
  };

  const handleCancelClick = (order: Order) => {
    setOrderToCancel(order);
    setIsCancelModalOpen(true);
  };

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;

    setIsCancelling(true);
    try {
      const response = await orderApi.cancelOrder(orderToCancel.id);
      if (response.success) {
        toast.success('✅ Order cancelled successfully!');
        
        // Immediately close modal first
        setIsCancelModalOpen(false);
        setOrderToCancel(null);
        setIsCancelling(false);
        
        // Invalidate cache
        queryClient.invalidateQueries(['orders', user?.id]);
        
        // Refetch data
        await refetch();
      }
    } catch (error: any) {
      console.error('Cancel error:', error);
      toast.error(error.message || 'Failed to cancel order. Please try again.');
      setIsCancelling(false);
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    try {
      await refetch();
      toast.success('Orders refreshed!');
    } catch (error) {
      toast.error('Failed to refresh orders');
    } finally {
      setIsRefreshing(false);
    }
  };

  const submitReview = async () => {
    if (!selectedMedicine) return;

    try {
      const response = await orderApi.addReview(selectedMedicine.id, {
        rating: reviewData.rating,
        comment: reviewData.comment,
      });

      if (response.success) {
        toast.success('✅ Review submitted successfully!');
        setIsReviewModalOpen(false);
        setReviewData({ rating: 5, comment: '' });
        // Invalidate cache and refetch
        queryClient.invalidateQueries(['orders', user?.id]);
        await refetch();
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    }
  };

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
      case 'CANCELLED': return XCircle;
      default: return Package;
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.medicine.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-BD', {
      day: 'numeric',
      month: 'short',
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

  // Calculate stats from real data
  const stats = [
    { 
      label: 'Total Orders', 
      value: orders.length, 
      icon: Package, 
      color: 'blue' 
    },
    { 
      label: 'Delivered', 
      value: orders.filter(o => o.status === 'DELIVERED').length, 
      icon: CheckCircle, 
      color: 'green' 
    },
    { 
      label: 'In Progress', 
      value: orders.filter(o => ['PLACED', 'PROCESSING', 'SHIPPED'].includes(o.status)).length, 
      icon: Clock, 
      color: 'yellow' 
    },
    { 
      label: 'Cancelled', 
      value: orders.filter(o => o.status === 'CANCELLED').length, 
      icon: XCircle, 
      color: 'red' 
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your orders..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-2">Track and manage all your orders</p>
            </div>
            <div className="flex items-center gap-3">
              {isFetching && (
                <span className="text-sm text-gray-500 animate-pulse">
                  Updating...
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={handleManualRefresh}
                disabled={isRefreshing || isFetching}
                className="flex items-center gap-2"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing || isFetching ? 'animate-spin' : ''}`} />
                {isRefreshing || isFetching ? 'Refreshing...' : 'Refresh'}
              </Button>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search orders or medicines..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">Status:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'ALL')}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="ALL">All Orders</option>
                <option value="PLACED">Placed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {filteredOrders.length > 0 ? (
          <>
            <div className="space-y-6">
              {filteredOrders.map((order: Order) => {
                const StatusIcon = getStatusIcon(order.status);
                const statusColor = getStatusColor(order.status);
                const canCancel = order.status === 'PLACED' || order.status === 'PROCESSING';
                
                return (
                  <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {/* Order Header */}
                    <div className="border-b border-gray-200 p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                          <div className="flex items-center space-x-3">
                            <h3 className="text-lg font-bold text-gray-900">
                              Order #{order.orderNumber}
                            </h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                              <StatusIcon className="h-3 w-3 inline mr-1" />
                              {order.status}
                            </span>
                          </div>
                          <p className="text-gray-500 text-sm mt-1">
                            Placed on {formatDate(order.createdAt)}
                            {order.updatedAt !== order.createdAt && (
                              <span className="ml-2">
                                • Updated: {formatDate(order.updatedAt)}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-bold text-gray-900">
                            {formatPrice(order.totalAmount)}
                          </p>
                          <p className="text-sm text-gray-500">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center space-x-3">
                            <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                              {item.medicine.imageUrl ? (
                                <img
                                  src={item.medicine.imageUrl}
                                  alt={item.medicine.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="flex items-center justify-center h-full">
                                  <Package className="h-6 w-6 text-gray-400" />
                                </div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-gray-900 truncate">
                                {item.medicine.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {item.quantity} × {formatPrice(item.price)}
                              </p>
                              {order.status === 'DELIVERED' && (
                                <button
                                  onClick={() => handleWriteReview(item.medicine)}
                                  className="text-primary-600 hover:text-primary-700 text-sm font-medium mt-1 flex items-center"
                                >
                                  <MessageSquare className="h-3 w-3 mr-1" />
                                  Write Review
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {order.items.length > 3 && (
                          <div className="flex items-center justify-center">
                            <span className="text-gray-500">
                              +{order.items.length - 3} more items
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Order Footer */}
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-6 border-t border-gray-100">
                        <div>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Shipping to:</span> {order.shippingAddress}
                          </p>
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Contact:</span> {order.phone}
                          </p>
                        </div>
                        <div className="flex space-x-3">
                          {/* শুধুমাত্র PLACED বা PROCESSING স্ট্যাটাসের অর্ডার ক্যান্সেল করা যাবে */}
                          {canCancel && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 disabled:opacity-50 disabled:cursor-not-allowed"
                              onClick={() => handleCancelClick(order)}
                              disabled={isCancelling}
                            >
                              <XCircle className="h-4 w-4 mr-1" />
                              {isCancelling ? 'Cancelling...' : 'Cancel Order'}
                            </Button>
                          )}
                          <Link href={`/orders/${order.id}`}>
                            <Button variant="outline" size="sm">
                              View Details
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Review Modal */}
            <Modal
              isOpen={isReviewModalOpen}
              onClose={() => setIsReviewModalOpen(false)}
              title="Write a Review"
              size="md"
            >
              <div className="p-6">
                {selectedMedicine && (
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {selectedMedicine.imageUrl ? (
                          <img
                            src={selectedMedicine.imageUrl}
                            alt={selectedMedicine.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="h-8 w-8 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{selectedMedicine.name}</h4>
                        <p className="text-sm text-gray-500">{selectedMedicine.manufacturer}</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Rating
                      </label>
                      <div className="flex items-center space-x-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewData({ ...reviewData, rating: star })}
                            className="p-1"
                          >
                            <Star
                              className={`h-8 w-8 ${
                                star <= reviewData.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 text-gray-700">
                          {reviewData.rating} out of 5
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Review (Optional)
                      </label>
                      <textarea
                        value={reviewData.comment}
                        onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Share your experience with this medicine..."
                      />
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => setIsReviewModalOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button onClick={submitReview}>
                        Submit Review
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Modal>

            {/* Cancel Order Confirmation Modal */}
            <Modal
              isOpen={isCancelModalOpen}
              onClose={() => {
                if (!isCancelling) {
                  setIsCancelModalOpen(false);
                  setOrderToCancel(null);
                }
              }}
              title="Cancel Order Confirmation"
              size="md"
            >
              <div className="p-6">
                {orderToCancel && (
                  <div className="space-y-6">
                    <div className="flex items-center justify-center text-red-600 mb-4">
                      <AlertTriangle className="h-12 w-12" />
                    </div>
                    
                    <div className="text-center">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        Are you sure you want to cancel this order?
                      </h3>
                      <p className="text-gray-600 mb-4">
                        This action cannot be undone. The stock for all medicines in this order will be restored.
                      </p>
                      
                      <div className="bg-gray-50 rounded-lg p-4 mb-6">
                        <p className="font-medium text-gray-900">
                          Order #{orderToCancel.orderNumber}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                          Total: {formatPrice(orderToCancel.totalAmount)} • {orderToCancel.items.length} item{orderToCancel.items.length !== 1 ? 's' : ''}
                        </p>
                        <p className="text-sm text-red-600 mt-1">
                          Current Status: {orderToCancel.status}
                        </p>
                        <div className="mt-2 text-sm text-gray-600">
                          <p className="font-medium">Items in this order:</p>
                          <ul className="mt-1 space-y-1">
                            {orderToCancel.items.slice(0, 3).map((item, index) => (
                              <li key={index} className="flex justify-between">
                                <span className="truncate">{item.medicine.name}</span>
                                <span>{item.quantity} × {formatPrice(item.price)}</span>
                              </li>
                            ))}
                            {orderToCancel.items.length > 3 && (
                              <li className="text-gray-500">
                                +{orderToCancel.items.length - 3} more items
                              </li>
                            )}
                          </ul>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsCancelModalOpen(false);
                          setOrderToCancel(null);
                        }}
                        disabled={isCancelling}
                      >
                        Keep Order
                      </Button>
                      <Button 
                        variant="danger"
                        onClick={handleCancelOrder}
                        className="bg-red-600 hover:bg-red-700 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={isCancelling}
                      >
                        {isCancelling ? (
                          <>
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                            Cancelling...
                          </>
                        ) : (
                          <>
                            <XCircle className="h-4 w-4 mr-2" />
                            Yes, Cancel Order
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Modal>
          </>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No Orders Found</h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {searchTerm || statusFilter !== 'ALL'
                ? 'No orders match your current filters. Try adjusting your search criteria.'
                : "You haven't placed any orders yet. Start shopping to discover amazing healthcare products!"}
            </p>
            {searchTerm || statusFilter !== 'ALL' ? (
              <Button 
                onClick={() => { 
                  setSearchTerm(''); 
                  setStatusFilter('ALL'); 
                  handleManualRefresh();
                }}
                className="flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="h-4 w-4" />
                Clear Filters & Refresh
              </Button>
            ) : (
              <Link href="/shop">
                <Button className="flex items-center gap-2 mx-auto">
                  <ShoppingBag className="h-4 w-4" />
                  Start Shopping
                </Button>
              </Link>
            )}
          </div>
        )}

        {/* Stats */}
        {orders.length > 0 && (
          <>
            <div className="mt-8 mb-4">
              <h2 className="text-xl font-bold text-gray-900">Order Summary</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                      stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                      stat.color === 'green' ? 'bg-green-50 text-green-600' :
                      stat.color === 'yellow' ? 'bg-yellow-50 text-yellow-600' :
                      stat.color === 'red' ? 'bg-red-50 text-red-600' :
                      'bg-purple-50 text-purple-600'
                    }`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                  {stat.label === 'Total Orders' && (
                    <p className="text-xs text-gray-500 mt-3">
                      Latest order: {orders.length > 0 ? formatDate(orders[0].createdAt) : 'N/A'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}