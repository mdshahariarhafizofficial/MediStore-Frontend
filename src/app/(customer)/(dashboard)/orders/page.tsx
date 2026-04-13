'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, CheckCircle, Clock, Truck, 
  XCircle, AlertCircle, Search, Filter,
  Star, MessageSquare, AlertTriangle, RefreshCw,
  ShoppingBag, Mail, Phone, MapPin, DollarSign,
  TrendingUp, BarChart, Calendar, FileText, Eye,
  ChevronRight, Home, Shield,  BarChart3, CreditCard, StatusIcon, User
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { orderApi } from '@/lib/api/order';
import { useAuthStore } from '@/store/auth.store';
import { Order, OrderStatus } from '@/lib/types';
import toast from 'react-hot-toast';
import Modal from '@/components/ui/Modal';

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
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [reviewData, setReviewData] = useState({ rating: 5, comment: '' });
  const [isCancelling, setIsCancelling] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

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
    isFetching,
    error: fetchError
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

  // Cancel order mutation
  const cancelOrderMutation = useMutation({
    mutationFn: (orderId: string) => orderApi.cancelOrder(orderId),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(' Order cancelled successfully!');
        
        // Invalidate and refetch orders
        queryClient.invalidateQueries({ queryKey: ['orders', user?.id] });
        refetch();
        
        setIsCancelModalOpen(false);
        setOrderToCancel(null);
        setCancelReason('');
      } else {
        toast.error(response.message || 'Failed to cancel order');
      }
      setIsCancelling(false);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to cancel order');
      setIsCancelling(false);
    },
  });

  // Add review mutation
  const addReviewMutation = useMutation({
    mutationFn: ({ medicineId, data }: { medicineId: string; data: any }) =>
      orderApi.addReview(medicineId, data),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(' Review submitted successfully!');
        setIsReviewModalOpen(false);
        setReviewData({ rating: 5, comment: '' });
        queryClient.invalidateQueries({ queryKey: ['orders', user?.id] });
        refetch();
      } else {
        toast.error(response.message || 'Failed to submit review');
      }
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || error.message || 'Failed to submit review');
    },
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

const handleViewOrder = (order: Order) => {
  router.push(`/orders/${order.id}`);
};

  const handleCancelOrder = async () => {
    if (!orderToCancel) return;

    setIsCancelling(true);
    cancelOrderMutation.mutate(orderToCancel.id);
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

    addReviewMutation.mutate({
      medicineId: selectedMedicine.id,
      data: reviewData
    });
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

  const getStatusDescription = (status: OrderStatus) => {
    switch (status) {
      case 'PLACED': return 'Order has been placed successfully';
      case 'PROCESSING': return 'Seller is preparing your order';
      case 'SHIPPED': return 'Order is on the way to you';
      case 'DELIVERED': return 'Order has been delivered';
      case 'CANCELLED': return 'Order has been cancelled';
      default: return 'Order status unknown';
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some(item => item.medicine.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      order.shippingAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
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

  const formatDateOnly = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-BD', {
      style: 'currency',
      currency: 'BDT',
      minimumFractionDigits: 2,
    }).format(price);
  };

  // Calculate stats from real data
  const totalOrders = orders.length;
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;
  const inProgressOrders = orders.filter(o => ['PLACED', 'PROCESSING', 'SHIPPED'].includes(o.status)).length;
  const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;
  const totalSpent = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  const stats = [
    { 
      label: 'Total Orders', 
      value: totalOrders, 
      icon: ShoppingBag, 
      color: 'bg-blue-500',
      description: 'All your orders'
    },
    { 
      label: 'Total Spent', 
      value: formatPrice(totalSpent), 
      icon: DollarSign, 
      color: 'bg-green-500',
      description: 'Total amount spent'
    },
    { 
      label: 'Success Rate', 
      value: totalOrders > 0 ? `${((deliveredOrders / totalOrders) * 100).toFixed(0)}%` : '0%', 
      icon: TrendingUp, 
      color: 'bg-emerald-500',
      description: 'Orders delivered'
    },
    { 
      label: 'Avg. Order', 
      value: formatPrice(avgOrderValue), 
      icon: BarChart3, 
      color: 'bg-purple-500',
      description: 'Average order value'
    },
  ];

  const canCancelOrder = (order: Order) => {
    return order.status === 'PLACED' || order.status === 'PROCESSING';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your orders..." />
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
            <AlertCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Orders</h2>
          <p className="text-gray-600 mb-6">
            Please check your internet connection and try again.
          </p>
          <Button onClick={() => refetch()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center text-sm text-gray-600 mb-2">
                <Link href="/" className="hover:text-primary-600 flex items-center">
                  <Home className="h-4 w-4 mr-1" />
                  Home
                </Link>
                <ChevronRight className="h-4 w-4 mx-2" />
                <span className="text-gray-900 font-medium">My Orders</span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
              <p className="text-gray-600 mt-2">Track and manage all your orders</p>
            </div>
            <div className="flex items-center gap-3">
              {isFetching && (
                <span className="text-sm text-gray-500 animate-pulse flex items-center">
                  <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
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

        {/* Stats Cards */}
        {orders.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500">{stat.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by order number, medicine name, or address..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">Status:</span>
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'ALL')}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[150px]"
              >
                <option value="ALL">All Orders</option>
                <option value="PLACED">Placed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              
              {(searchTerm || statusFilter !== 'ALL') && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('ALL');
                  }}
                  className="flex items-center gap-2"
                >
                  <XCircle className="h-4 w-4" />
                  Clear Filters
                </Button>
              )}
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
                const statusDescription = getStatusDescription(order.status);
                const canCancel = canCancelOrder(order);
                
                return (
                  <div key={order.id} className="bg-white rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                    {/* Order Header */}
                    <div className="border-b border-gray-200 p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center flex-wrap gap-3 mb-2">
                            <h3 className="text-lg font-bold text-gray-900">
                              Order #{order.orderNumber}
                            </h3>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${statusColor}`}>
                                <StatusIcon className="h-3 w-3" />
                                {order.status}
                              </span>
                              {order.paymentMethod === 'COD' && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                                  Cash on Delivery
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center">
                              <Calendar className="h-4 w-4 mr-1" />
                              {formatDate(order.createdAt)}
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="h-4 w-4 mr-1" />
                              {formatPrice(order.totalAmount)}
                            </div>
                            <div className="flex items-center">
                              <Package className="h-4 w-4 mr-1" />
                              {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                            </div>
                          </div>
                          
                          <p className="text-sm text-gray-500 mt-2">
                            {statusDescription}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                          <Link href={`/orders/${order.id}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="flex items-center gap-2"
                            >
                              <Eye className="h-4 w-4" />
                              View Details
                            </Button>
                          </Link>
                          
                          {canCancel && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCancelClick(order)}
                              disabled={isCancelling}
                              className="border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400 flex items-center gap-2"
                            >
                              <XCircle className="h-4 w-4" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Order Items Preview */}
                    <div className="p-6">
                      <h4 className="font-medium text-gray-900 mb-4">Order Items</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {order.items.slice(0, 3).map((item, index) => (
                          <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                            <div className="w-16 h-16 bg-white border border-gray-200 rounded-lg overflow-hidden flex-shrink-0">
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
                              <p className="text-sm font-medium text-primary-700">
                                Subtotal: {formatPrice(item.quantity * item.price)}
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
                          <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-center">
                              <Package className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                              <p className="text-gray-700 font-medium">
                                +{order.items.length - 3} more items
                              </p>
                              <button
                                onClick={() => handleViewOrder(order)}
                                className="text-primary-600 hover:text-primary-700 text-sm mt-1"
                              >
                                View all items
                              </button>
                            </div>
                          </div>
                        )}
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
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                        {selectedMedicine.imageUrl ? (
                          <img
                            src={selectedMedicine.imageUrl}
                            alt={selectedMedicine.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="flex items-center justify-center h-full">
                            <Package className="h-10 w-10 text-gray-400" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900">{selectedMedicine.name}</h4>
                        <p className="text-sm text-gray-500">{selectedMedicine.manufacturer}</p>
                        <p className="text-sm text-gray-500">
                          Category: {selectedMedicine.category?.name || 'General'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        How would you rate this medicine?
                      </label>
                      <div className="flex items-center justify-center space-x-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewData({ ...reviewData, rating: star })}
                            className="p-1 transition-transform hover:scale-110"
                          >
                            <Star
                              className={`h-10 w-10 ${
                                star <= reviewData.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        ))}
                      </div>
                      <div className="text-center">
                        <span className="text-gray-700 font-medium">
                          {reviewData.rating} {reviewData.rating === 1 ? 'star' : 'stars'}
                        </span>
                        <p className="text-sm text-gray-500 mt-1">
                          {reviewData.rating === 5 ? 'Excellent' : 
                           reviewData.rating === 4 ? 'Good' : 
                           reviewData.rating === 3 ? 'Average' : 
                           reviewData.rating === 2 ? 'Poor' : 'Very Poor'}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Share your experience (Optional)
                      </label>
                      <textarea
                        value={reviewData.comment}
                        onChange={(e) => setReviewData({ ...reviewData, comment: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Tell others about your experience with this medicine. Was it effective? Any side effects?"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Your review will help other customers make better decisions.
                      </p>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsReviewModalOpen(false);
                          setReviewData({ rating: 5, comment: '' });
                        }}
                        disabled={addReviewMutation.isLoading}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={submitReview}
                        loading={addReviewMutation.isLoading}
                      >
                        Submit Review
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Modal>

            {/* Cancel Order Modal */}
            <Modal
              isOpen={isCancelModalOpen}
              onClose={() => {
                if (!isCancelling) {
                  setIsCancelModalOpen(false);
                  setOrderToCancel(null);
                  setCancelReason('');
                }
              }}
              title="Cancel Order"
              size="md"
            >
              {orderToCancel && (
                <div className="p-6">
                  <div className="text-center mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-4">
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Cancel Order #{orderToCancel.orderNumber}?
                    </h3>
                    <p className="text-gray-600">
                      Please confirm you want to cancel this order.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <p className="text-gray-500">Order Total</p>
                          <p className="font-bold text-gray-900">{formatPrice(orderToCancel.totalAmount)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Items</p>
                          <p className="font-bold text-gray-900">{orderToCancel.items.length}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Order Date</p>
                          <p className="font-medium text-gray-900">{formatDateOnly(orderToCancel.createdAt)}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Current Status</p>
                          <p className="font-medium text-gray-900">{orderToCancel.status}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reason for cancellation (Optional)
                      </label>
                      <textarea
                        value={cancelReason}
                        onChange={(e) => setCancelReason(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        placeholder="Please tell us why you're cancelling this order..."
                      />
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                      <div className="flex items-start">
                        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" />
                        <div className="text-sm text-yellow-800">
                          <p className="font-medium">Important Notes:</p>
                          <ul className="mt-2 space-y-1">
                            <li>• This action cannot be undone</li>
                            <li>• Stock will be restored for all medicines</li>
                            <li>• Seller will be notified about cancellation</li>
                            <li>• Refund will be processed as per policy</li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsCancelModalOpen(false);
                        setOrderToCancel(null);
                        setCancelReason('');
                      }}
                      disabled={isCancelling}
                    >
                      Keep Order
                    </Button>
                    <Button
                      variant="danger"
                      onClick={handleCancelOrder}
                      loading={isCancelling}
                    >
                      {isCancelling ? 'Cancelling...' : 'Confirm Cancellation'}
                    </Button>
                  </div>
                </div>
              )}
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

        {/* Pagination or Additional Info */}
        {filteredOrders.length > 0 && (
          <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-sm text-gray-600">
            <div>
              Showing {filteredOrders.length} of {orders.length} order{orders.length !== 1 ? 's' : ''}
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Shield className="h-4 w-4 text-green-600" />
                <span>100% Secure Payments</span>
              </div>
              <div className="flex items-center gap-2">
                <Truck className="h-4 w-4 text-blue-600" />
                <span>Fast Delivery</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-primary-600" />
                <span>24/7 Support</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}