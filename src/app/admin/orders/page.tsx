'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, Filter, Package, DollarSign, 
  User, Truck, CheckCircle, Clock, Eye,
  TrendingUp, BarChart3, Download, RefreshCw,
  XCircle, Edit, MoreVertical, MapPin, Phone,
  ShoppingBag, ChevronDown, Calendar, AlertCircle,
  FileText, Check, X, Mail
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useAuthStore } from '@/store/auth.store';
import { adminApi } from '@/lib/api/admin';
import { Order, OrderStatus } from '@/lib/types';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isUpdateStatusModalOpen, setIsUpdateStatusModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<OrderStatus>('PLACED');
  const [isExporting, setIsExporting] = useState(false);

  // Redirect if not authenticated as admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  // Fetch all orders
  const { data: ordersData, isLoading, refetch } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => adminApi.getOrders(),
    enabled: isAuthenticated && user?.role === 'ADMIN',
  });

  const orders = ordersData?.data || [];

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = searchTerm === '' || 
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.seller?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shippingAddress.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    
    // Date filtering
    let matchesDate = true;
    if (dateFilter !== 'ALL') {
      const orderDate = new Date(order.createdAt);
      const today = new Date();
      
      switch (dateFilter) {
        case 'TODAY':
          matchesDate = orderDate.toDateString() === today.toDateString();
          break;
        case 'WEEK':
          const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= weekAgo;
          break;
        case 'MONTH':
          const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
          matchesDate = orderDate >= monthAgo;
          break;
      }
    }
    
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Handle order actions
  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsViewModalOpen(true);
  };

  const handleUpdateStatus = (order: Order) => {
    setSelectedOrder(order);
    setNewStatus(order.status);
    setIsUpdateStatusModalOpen(true);
  };

  const handleDeleteOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsDeleteModalOpen(true);
  };

  const confirmUpdateStatus = async () => {
    if (!selectedOrder) return;
    
    try {
      await adminApi.updateOrderStatus(selectedOrder.id, newStatus);
      toast.success('Order status updated successfully');
      refetch();
      setIsUpdateStatusModalOpen(false);
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const confirmDeleteOrder = async () => {
    if (!selectedOrder) return;
    
    try {
      await adminApi.deleteOrder(selectedOrder.id);
      toast.success('Order deleted successfully');
      refetch();
      setIsDeleteModalOpen(false);
    } catch (error) {
      toast.error('Failed to delete order');
    }
  };

  // Export orders to CSV
  const handleExportOrders = async () => {
    setIsExporting(true);
    try {
      const csvData = [
        ['Order Number', 'Customer', 'Seller', 'Date', 'Amount', 'Status', 'Items', 'Shipping Address', 'Phone'],
        ...filteredOrders.map(order => [
          order.orderNumber,
          order.customer?.name || 'N/A',
          order.seller?.name || 'N/A',
          formatDate(order.createdAt),
          `৳${order.totalAmount}`,
          order.status,
          order.items.length,
          order.shippingAddress,
          order.phone,
        ])
      ];

      const csvContent = csvData.map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `medistore-orders-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Orders exported successfully');
    } catch (error) {
      toast.error('Failed to export orders');
    } finally {
      setIsExporting(false);
    }
  };

  // Calculate stats
  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const deliveredOrders = orders.filter(o => o.status === 'DELIVERED').length;
  const pendingOrders = orders.filter(o => ['PLACED', 'PROCESSING'].includes(o.status)).length;
  const cancelledOrders = orders.filter(o => o.status === 'CANCELLED').length;

  const stats = [
    { 
      label: 'Total Orders', 
      value: orders.length, 
      icon: Package, 
      color: 'bg-blue-500',
      change: orders.length > 0 ? `${orders.length} orders` : 'No orders'
    },
    { 
      label: 'Total Revenue', 
      value: `৳${totalRevenue.toLocaleString('en-BD')}`, 
      icon: DollarSign, 
      color: 'bg-green-500',
      change: orders.length > 0 ? `৳${(totalRevenue / orders.length).toFixed(0)} avg` : 'No revenue'
    },
    { 
      label: 'Success Rate', 
      value: orders.length > 0 ? `${((deliveredOrders / orders.length) * 100).toFixed(1)}%` : '0%', 
      icon: CheckCircle, 
      color: 'bg-emerald-500',
      change: `${deliveredOrders} delivered`
    },
    { 
      label: 'Pending Orders', 
      value: pendingOrders, 
      icon: Clock, 
      color: 'bg-yellow-500',
      change: pendingOrders > 0 ? `${pendingOrders} pending` : 'All clear'
    },
  ];

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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-BD', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-BD', {
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
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">All Orders</h1>
            <p className="text-gray-600 mt-2">Monitor and manage all orders across the platform</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="flex items-center gap-2"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button
              onClick={handleExportOrders}
              variant="outline"
              className="flex items-center gap-2"
              disabled={isExporting || filteredOrders.length === 0}
            >
              <Download className="h-4 w-4" />
              {isExporting ? 'Exporting...' : 'Export CSV'}
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`${stat.color} w-12 h-12 rounded-xl flex items-center justify-center`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.label.includes('Rate') && parseFloat(stat.value) > 70 ? 'bg-green-100 text-green-800' :
                  stat.label.includes('Pending') && parseInt(stat.value) > 0 ? 'bg-yellow-100 text-yellow-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {stat.change}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-gray-600">{stat.label}</p>
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
                placeholder="Search by order number, customer, seller, or address..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[140px]"
                >
                  <option value="ALL">All Status</option>
                  <option value="PLACED">Placed</option>
                  <option value="PROCESSING">Processing</option>
                  <option value="SHIPPED">Shipped</option>
                  <option value="DELIVERED">Delivered</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Date:</label>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent min-w-[140px]"
                >
                  <option value="ALL">All Time</option>
                  <option value="TODAY">Today</option>
                  <option value="WEEK">This Week</option>
                  <option value="MONTH">This Month</option>
                </select>
              </div>
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
                    <th className="text-left py-4 px-6 text-sm font-medium text-gray-500">Order Details</th>
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
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">
                            #{order.orderNumber}
                          </div>
                          <div className="text-sm text-gray-500 mt-1">
                            {order.items.length} item{order.items.length !== 1 ? 's' : ''}
                          </div>
                          <div className="text-xs text-gray-400 mt-1 truncate max-w-[200px]">
                            {order.shippingAddress}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center">
                              <User className="h-4 w-4 text-blue-600" />
                            </div>
                            <div>
                              <div className="font-medium text-gray-900">{order.customer?.name || 'Unknown'}</div>
                              <div className="text-sm text-gray-500 truncate max-w-[150px]">
                                {order.customer?.email || 'N/A'}
                              </div>
                              <div className="text-xs text-gray-500">{order.phone}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="text-gray-900">{formatDate(order.createdAt)}</div>
                          <div className="text-sm text-gray-500">
                            {order.paymentMethod}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="font-bold text-gray-900">
                            {formatPrice(order.totalAmount)}
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <StatusIcon className="h-4 w-4" />
                            <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${statusColor}`}>
                              {order.status}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewOrder(order)}
                              title="View Details"
                              className="text-gray-500 hover:text-blue-600"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleUpdateStatus(order)}
                              title="Update Status"
                              className="text-gray-500 hover:text-yellow-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            {order.status !== 'DELIVERED' && order.status !== 'CANCELLED' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteOrder(order)}
                                title="Delete Order"
                                className="text-gray-500 hover:text-red-600"
                              >
                                <XCircle className="h-4 w-4" />
                              </Button>
                            )}
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
                {searchTerm || statusFilter !== 'ALL' || dateFilter !== 'ALL'
                  ? 'No orders match your current filters. Try adjusting your search criteria.'
                  : 'No orders found in the system.'}
              </p>
              {searchTerm || statusFilter !== 'ALL' || dateFilter !== 'ALL' ? (
                <Button onClick={() => { 
                  setSearchTerm(''); 
                  setStatusFilter('ALL');
                  setDateFilter('ALL');
                }}>
                  Clear Filters
                </Button>
              ) : null}
            </div>
          )}
        </div>

        {/* Summary Cards */}
        {filteredOrders.length > 0 && (
          <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Orders Value</p>
                  <p className="text-3xl font-bold mt-2">
                    {formatPrice(filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0))}
                  </p>
                </div>
                <DollarSign className="h-8 w-8" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Avg. Order Value</p>
                  <p className="text-3xl font-bold mt-2">
                    {formatPrice(filteredOrders.length > 0 ? 
                      filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0) / filteredOrders.length : 0)}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8" />
              </div>
            </div>
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Success Rate</p>
                  <p className="text-3xl font-bold mt-2">
                    {filteredOrders.length > 0 ? 
                      ((filteredOrders.filter(o => o.status === 'DELIVERED').length / filteredOrders.length) * 100).toFixed(1) : 0}%
                  </p>
                </div>
                <CheckCircle className="h-8 w-8" />
              </div>
            </div>
          </div>
        )}

        {/* View Order Modal */}
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title="Order Details"
          size="xl"
        >
          {selectedOrder && (
            <div className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-6">
                  {/* Order Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-gray-900">Order #{selectedOrder.orderNumber}</h3>
                        <p className="text-sm text-gray-600">
                          Placed on {formatDateTime(selectedOrder.createdAt)}
                        </p>
                      </div>
                      <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${getStatusColor(selectedOrder.status)}`}>
                        {selectedOrder.status}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Payment Method</p>
                        <p className="font-medium">{selectedOrder.paymentMethod}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Total Amount</p>
                        <p className="font-bold text-lg text-primary-700">
                          {formatPrice(selectedOrder.totalAmount)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-4">Order Items ({selectedOrder.items.length})</h4>
                    <div className="space-y-3">
                      {selectedOrder.items.map((item, index) => (
                        <div key={item.id} className="flex items-center justify-between p-3 bg-white rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                              <Package className="h-5 w-5 text-primary-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{item.medicine?.name || `Item ${index + 1}`}</p>
                              <p className="text-sm text-gray-600">Qty: {item.quantity} × ৳{item.price}</p>
                            </div>
                          </div>
                          <p className="font-bold text-gray-900">
                            ৳{(item.quantity * item.price).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  {/* Customer Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-4">Customer Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{selectedOrder.customer?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{selectedOrder.customer?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{selectedOrder.phone}</span>
                      </div>
                    </div>
                  </div>

                  {/* Shipping Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-4">Shipping Address</h4>
                    <div className="flex items-start text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                      <span>{selectedOrder.shippingAddress}</span>
                    </div>
                  </div>

                  {/* Seller Info */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-bold text-gray-900 mb-4">Seller Information</h4>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <User className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{selectedOrder.seller?.name || 'Unknown'}</span>
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                        <span>{selectedOrder.seller?.email || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setIsViewModalOpen(false)}
                >
                  Close
                </Button>
                <Button
                  variant="primary"
                  onClick={() => {
                    setIsViewModalOpen(false);
                    handleUpdateStatus(selectedOrder);
                  }}
                >
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Update Status Modal */}
        <Modal
          isOpen={isUpdateStatusModalOpen}
          onClose={() => setIsUpdateStatusModalOpen(false)}
          title="Update Order Status"
          size="md"
        >
          {selectedOrder && (
            <div className="p-6">
              <div className="text-center mb-6">
                <Edit className="h-12 w-12 text-primary-600 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Update Order #{selectedOrder.orderNumber}
                </h3>
                <p className="text-gray-600">Select new status for this order</p>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Status
                  </label>
                  <div className={`px-4 py-3 rounded-lg ${getStatusColor(selectedOrder.status)} font-medium`}>
                    {selectedOrder.status}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Status
                  </label>
                  <select
                    value={newStatus}
                    onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="PLACED">Placed</option>
                    <option value="PROCESSING">Processing</option>
                    <option value="SHIPPED">Shipped</option>
                    <option value="DELIVERED">Delivered</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>

                {newStatus === 'CANCELLED' && (
                  <div className="p-4 bg-red-50 rounded-lg">
                    <div className="flex items-center text-red-800">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <p className="text-sm">
                        Cancelling an order will notify the customer and seller.
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <Button
                  variant="outline"
                  onClick={() => setIsUpdateStatusModalOpen(false)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  onClick={confirmUpdateStatus}
                  disabled={newStatus === selectedOrder.status}
                >
                  Update Status
                </Button>
              </div>
            </div>
          )}
        </Modal>

        {/* Delete Order Modal */}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Order"
          size="md"
        >
          {selectedOrder && (
            <div className="p-6">
              <div className="text-center">
                <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Delete Order #{selectedOrder.orderNumber}?
                </h3>
                <p className="text-gray-600 mb-6">
                  This action cannot be undone. The order will be permanently deleted.
                </p>
                <div className="bg-red-50 p-4 rounded-lg mb-6">
                  <div className="text-left">
                    <p className="font-medium">{selectedOrder.customer?.name}</p>
                    <p className="text-sm text-gray-600">{selectedOrder.customer?.email}</p>
                    <div className="mt-3 space-y-2 text-sm text-gray-600">
                      <p>• Amount: {formatPrice(selectedOrder.totalAmount)}</p>
                      <p>• Items: {selectedOrder.items.length}</p>
                      <p>• Status: {selectedOrder.status}</p>
                      <p>• Date: {formatDate(selectedOrder.createdAt)}</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center space-x-3">
                  <Button
                    variant="outline"
                    onClick={() => setIsDeleteModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="danger"
                    onClick={confirmDeleteOrder}
                  >
                    Delete Order
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>
      </div>
    </div>
  );
}