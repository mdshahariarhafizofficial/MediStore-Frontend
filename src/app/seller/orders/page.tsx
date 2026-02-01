'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Filter, Eye, Truck, CheckCircle, 
  Clock, Package, XCircle, MoreVertical,
  TrendingUp, DollarSign, Users
} from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/store/auth.store';
import { sellerApi } from '@/lib/api/seller';

export default function SellerOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');

  // Redirect if not authenticated as seller
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'SELLER') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  // Fetch seller orders
  const { data: ordersData, isLoading, refetch } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: () => sellerApi.getOrders(),
    enabled: isAuthenticated && user?.role === 'SELLER',
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      sellerApi.updateOrderStatus(id, { status }),
    onSuccess: () => {
      toast.success('Order status updated successfully');
      refetch();
      setIsStatusModalOpen(false);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update order status');
    },
  });

  const orders = ordersData?.data || [];

  const handleUpdateStatus = (order: any, status: string) => {
    setSelectedOrder(order);
    setSelectedStatus(status);
    setIsStatusModalOpen(true);
  };

  const confirmStatusUpdate = () => {
    if (selectedOrder) {
      updateStatusMutation.mutate({
        id: selectedOrder.id,
        status: selectedStatus,
      });
    }
  };

  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = [
    { label: 'Total Orders', value: orders.length, icon: Package, color: 'blue' },
    { label: 'Processing', value: orders.filter(o => o.status === 'PROCESSING').length, icon: Clock, color: 'yellow' },
    { label: 'Shipped', value: orders.filter(o => o.status === 'SHIPPED').length, icon: Truck, color: 'purple' },
    { label: 'Delivered', value: orders.filter(o => o.status === 'DELIVERED').length, icon: CheckCircle, color: 'green' },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PLACED': return 'bg-blue-100 text-blue-800';
      case 'PROCESSING': return 'bg-yellow-100 text-yellow-800';
      case 'SHIPPED': return 'bg-purple-100 text-purple-800';
      case 'DELIVERED': return 'bg-green-100 text-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PLACED': return Package;
      case 'PROCESSING': return Clock;
      case 'SHIPPED': return Truck;
      case 'DELIVERED': return CheckCircle;
      case 'CANCELLED': return XCircle;
      default: return Package;
    }
  };

  const formatDate = (dateString: string) => {
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
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading orders..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Manage Orders</h1>
          <p className="text-gray-600 mt-2">Track and update customer orders from your store</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                  stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                  stat.color === 'yellow' ? 'bg-yellow-50 text-yellow-600' :
                  stat.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                  'bg-green-50 text-green-600'
                }`}>
                  <stat.icon className="h-6 w-6" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search and Filter */}
        <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by order number or customer name..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex items-center space-x-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="ALL">All Status</option>
                <option value="PLACED">Placed</option>
                <option value="PROCESSING">Processing</option>
                <option value="SHIPPED">Shipped</option>
                <option value="DELIVERED">Delivered</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
              <button className="flex items-center px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50">
                <Filter className="h-4 w-4 mr-2" />
                More Filters
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
          {filteredOrders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Order ID</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Customer</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Date</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Amount</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Status</th>
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {filteredOrders.map((order) => {
                    const StatusIcon = getStatusIcon(order.status);
                    const statusColor = getStatusColor(order.status);
                    
                    return (
                      <tr key={order.id} className="hover:bg-gray-50">
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">
                            #{order.orderNumber}
                          </div>
                          <div className="text-sm text-gray-500">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-gray-900">{order.customer?.name}</div>
                          <div className="text-sm text-gray-500">{order.customer?.email}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-gray-900">{formatDate(order.createdAt)}</div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-gray-900">
                            {formatPrice(order.totalAmount)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <StatusIcon className="h-4 w-4" />
                            <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor}`}>
                              {order.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <button className="p-2 text-gray-400 hover:text-blue-600">
                              <Eye className="h-4 w-4" />
                            </button>
                            
                            {/* Status Update Buttons */}
                            {order.status === 'PLACED' && (
                              <button
                                onClick={() => handleUpdateStatus(order, 'PROCESSING')}
                                className="px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg text-sm font-medium hover:bg-yellow-100"
                              >
                                Start Processing
                              </button>
                            )}
                            
                            {order.status === 'PROCESSING' && (
                              <button
                                onClick={() => handleUpdateStatus(order, 'SHIPPED')}
                                className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100"
                              >
                                Mark as Shipped
                              </button>
                            )}
                            
                            {order.status === 'SHIPPED' && (
                              <button
                                onClick={() => handleUpdateStatus(order, 'DELIVERED')}
                                className="px-3 py-1 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100"
                              >
                                Mark as Delivered
                              </button>
                            )}
                            
                            <button className="p-2 text-gray-400 hover:text-gray-600">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <Package className="h-12 w-12 text-gray-400" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">No Orders Found</h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                {searchTerm || statusFilter !== 'ALL'
                  ? 'No orders match your current filters. Try adjusting your search criteria.'
                  : "You haven't received any orders yet. Your orders will appear here."}
              </p>
              {searchTerm || statusFilter !== 'ALL' ? (
                <Button onClick={() => { setSearchTerm(''); setStatusFilter('ALL'); }}>
                  Clear Filters
                </Button>
              ) : null}
            </div>
          )}
        </div>

        {/* Status Update Modal */}
        {isStatusModalOpen && selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Update Order Status</h3>
                <p className="text-gray-600 mb-6">
                  Update order #{selectedOrder.orderNumber} from{' '}
                  <span className="font-medium">{selectedOrder.status}</span> to{' '}
                  <span className="font-medium">{selectedStatus}</span>
                </p>
                
                <div className="space-y-4 mb-6">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Customer</p>
                    <p className="font-medium">{selectedOrder.customer?.name}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Order Total</p>
                    <p className="font-medium">{formatPrice(selectedOrder.totalAmount)}</p>
                  </div>
                  
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500 mb-1">Items</p>
                    <p className="font-medium">{selectedOrder.items.length} items</p>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsStatusModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    loading={updateStatusMutation.isPending}
                    onClick={confirmStatusUpdate}
                  >
                    Update Status
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}