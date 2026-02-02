'use client';

import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Users, 
  Package, 
  ShoppingBag, 
  DollarSign, 
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingUp
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/store/auth.store'; // <-- Zustand store ব্যবহার করুন
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Order, Medicine, Category } from '@/lib/types';

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuthStore(); // <-- Zustand থেকে state নিন
  const router = useRouter();

  // Redirect if not authenticated or not admin
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [user, isAuthenticated, router]);

  // Fetch users
  const {
    data: usersResponse,
    isLoading: usersLoading,
    error: usersError,
    refetch: refetchUsers
  } = useQuery({
    queryKey: ['admin-users'],
    queryFn: () => adminApi.getUsers(),
    enabled: !!user && user.role === 'ADMIN',
    retry: 2,
    retryDelay: 1000
  });

  // Fetch orders
  const {
    data: ordersResponse,
    isLoading: ordersLoading,
    error: ordersError,
    refetch: refetchOrders
  } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: () => adminApi.getOrders(),
    enabled: !!user && user.role === 'ADMIN',
    retry: 2,
    retryDelay: 1000
  });

  // Fetch categories
  const {
    data: categoriesResponse,
    isLoading: categoriesLoading,
    error: categoriesError,
    refetch: refetchCategories
  } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => adminApi.getCategories(),
    enabled: !!user && user.role === 'ADMIN',
    retry: 2,
    retryDelay: 1000
  });

  // Refetch all data function
  const refetchAll = () => {
    refetchUsers();
    refetchOrders();
    refetchCategories();
  };

  // Loading state
  const isLoading = usersLoading || ordersLoading || categoriesLoading;
  const hasError = usersError || ordersError || categoriesError;

  // Data extraction
  const users: User[] = usersResponse?.data || [];
  const orders: Order[] = ordersResponse?.data || [];
  const categories: Category[] = categoriesResponse?.data || [];

  // Calculate statistics
  const totalRevenue = orders.reduce((sum: number, order: Order) => 
    sum + (order.totalAmount || 0), 0
  );
  
  const activeUsers = users.filter((user: User) => user.isActive).length;
  const pendingOrders = orders.filter((order: Order) => 
    order.status === 'PLACED' || order.status === 'PROCESSING'
  ).length;
  
  const deliveredOrders = orders.filter((order: Order) => 
    order.status === 'DELIVERED'
  ).length;

  const stats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: Users,
      color: 'bg-blue-500',
      change: `${users.length} registered`,
      trend: users.length > 0 ? 'up' : 'neutral' as const,
    },
    {
      title: 'Active Users',
      value: activeUsers,
      icon: CheckCircle,
      color: 'bg-green-500',
      change: `${((activeUsers / users.length) * 100 || 0).toFixed(1)}% active`,
      trend: activeUsers > 0 ? 'up' : 'neutral' as const,
    },
    {
      title: 'Categories',
      value: categories.length,
      icon: Package,
      color: 'bg-purple-500',
      change: `${categories.length} categories`,
      trend: 'neutral' as const,
    },
    {
      title: 'Total Orders',
      value: orders.length,
      icon: ShoppingBag,
      color: 'bg-indigo-500',
      change: `${deliveredOrders} delivered`,
      trend: orders.length > 0 ? 'up' : 'neutral' as const,
    },
    {
      title: 'Pending Orders',
      value: pendingOrders,
      icon: AlertCircle,
      color: 'bg-yellow-500',
      change: pendingOrders > 0 ? `${pendingOrders} pending` : 'All clear',
      trend: pendingOrders > 0 ? 'up' : 'neutral' as const,
    },
    {
      title: 'Total Revenue',
      value: `৳${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-emerald-500',
      change: `৳${(totalRevenue / (orders.length || 1)).toFixed(2)} avg`,
      trend: totalRevenue > 0 ? 'up' : 'neutral' as const,
    },
  ];

  // Format date function
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED': return { text: 'Delivered', color: 'bg-green-100 text-green-800' };
      case 'CANCELLED': return { text: 'Cancelled', color: 'bg-red-100 text-red-800' };
      case 'SHIPPED': return { text: 'Shipped', color: 'bg-blue-100 text-blue-800' };
      case 'PROCESSING': return { text: 'Processing', color: 'bg-yellow-100 text-yellow-800' };
      case 'PLACED': return { text: 'Placed', color: 'bg-orange-100 text-orange-800' };
      default: return { text: 'Unknown', color: 'bg-gray-100 text-gray-800' };
    }
  };

  // Get role badge
  const getRoleBadge = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return { text: 'Admin', color: 'bg-purple-100 text-purple-800' };
      case 'SELLER': return { text: 'Seller', color: 'bg-blue-100 text-blue-800' };
      default: return { text: 'Customer', color: 'bg-green-100 text-green-800' };
    }
  };

  // Recent items
  const recentUsers = users.slice(0, 5);
  const recentOrders = orders.slice(0, 5);

  // Loading UI
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Error UI
  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Failed to Load Data</h2>
            <p className="text-gray-600 mb-6">
              Unable to fetch dashboard data. Please check your connection.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={refetchAll}
                className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
              >
                Retry Loading
              </button>
              <Link
                href="/"
                className="px-6 py-3 bg-white text-gray-700 border border-gray-300 font-medium rounded-lg hover:bg-gray-50 transition-colors"
              >
                Go to Home
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Access denied UI
  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-lg">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">
            You need administrator privileges to access this page.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              href="/"
              className="px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 transition-colors"
            >
              Go to Home
            </Link>
            <Link
              href="/login"
              className="px-6 py-3 bg-white text-primary-600 border border-primary-600 font-medium rounded-lg hover:bg-primary-50 transition-colors"
            >
              Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-gray-600 mt-2">
                Welcome back, <span className="font-semibold text-primary-600">{user?.name}</span>!
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex flex-wrap gap-2">
              <button
                onClick={refetchAll}
                className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                Refresh Data
              </button>
              <Link
                href="/admin/users"
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Manage Users
              </Link>
              <Link
                href="/admin/orders"
                className="px-4 py-2 bg-white text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors text-sm font-medium"
              >
                View Orders
              </Link>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className={`${stat.color} p-2 rounded-lg`}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                <div className={`text-xs font-medium px-2 py-1 rounded-full ${
                  stat.trend === 'up' ? 'bg-green-100 text-green-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {stat.change}
                </div>
              </div>
              <p className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
                {stat.title}
              </p>
            </div>
          ))}
        </div>

        {/* Recent Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Recent Users */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Recent Users</h2>
                  <p className="text-sm text-gray-600 mt-1">Latest registered users</p>
                </div>
                <Link
                  href="/admin/users"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
                >
                  View All
                  <span className="ml-1">→</span>
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {recentUsers.map((userItem) => {
                const roleBadge = getRoleBadge(userItem.role);
                return (
                  <div
                    key={userItem.id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-100 to-primary-100 flex items-center justify-center">
                            <span className="text-primary-700 font-bold text-sm">
                              {userItem.name?.charAt(0).toUpperCase() || 'U'}
                            </span>
                          </div>
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{userItem.name}</p>
                          <p className="text-sm text-gray-500 truncate max-w-[180px]">
                            {userItem.email}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full mb-1 ${roleBadge.color}`}>
                          {roleBadge.text}
                        </span>
                        <span className={`px-2 py-0.5 text-xs rounded-full ${
                          userItem.isActive 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {userItem.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 bg-gradient-to-r from-green-50 to-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Recent Orders</h2>
                  <p className="text-sm text-gray-600 mt-1">Latest customer orders</p>
                </div>
                <Link
                  href="/admin/orders"
                  className="text-sm text-primary-600 hover:text-primary-700 font-medium flex items-center"
                >
                  View All
                  <span className="ml-1">→</span>
                </Link>
              </div>
            </div>
            <div className="divide-y divide-gray-100">
              {recentOrders.map((order) => {
                const statusBadge = getStatusBadge(order.status);
                return (
                  <div
                    key={order.id}
                    className="px-6 py-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <p className="font-medium text-gray-900">
                            Order #{order.orderNumber?.substring(0, 10) || order.id.substring(0, 8)}
                          </p>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${statusBadge.color}`}>
                            {statusBadge.text}
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">
                          {order.customer?.name || 'Unknown Customer'} • {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-primary-700 text-lg">
                          ৳{(order.totalAmount || 0).toFixed(2)}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {order.items?.length || 0} items
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Categories Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900">Categories</h3>
              <span className="text-2xl font-bold text-primary-600">
                {categories.length}
              </span>
            </div>
            <div className="space-y-3">
              {categories.slice(0, 4).map((category) => (
                <div key={category.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <span className="font-medium text-gray-900">{category.name}</span>
                  <span className="text-sm text-gray-500">
                    {category._count?.medicines || 0} medicines
                  </span>
                </div>
              ))}
            </div>
            <Link
              href="/admin/categories"
              className="block mt-4 text-center py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
            >
              Manage All Categories
            </Link>
          </div>

          {/* Order Status Summary */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Order Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-gray-700">Delivered</span>
                </div>
                <span className="font-bold text-gray-900">{deliveredOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-yellow-500 mr-2"></div>
                  <span className="text-gray-700">Pending</span>
                </div>
                <span className="font-bold text-gray-900">{pendingOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-gray-700">Shipped</span>
                </div>
                <span className="font-bold text-gray-900">
                  {orders.filter((o: Order) => o.status === 'SHIPPED').length}
                </span>
              </div>
            </div>
            <div className="mt-6 pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <span className="font-semibold text-primary-600">
                  {((deliveredOrders / (orders.length || 1)) * 100).toFixed(1)}%
                </span> of orders have been delivered
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-primary-50 to-blue-50 rounded-xl shadow-sm border border-primary-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link
                href="/admin/categories"
                className="block w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                + Add New Category
              </Link>
              <Link
                href="/admin/users"
                className="block w-full px-4 py-3 bg-white text-gray-900 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                + Create New User
              </Link>
              <Link
                href="/admin"
                className="block w-full px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium text-center"
              >
                View Analytics Report
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}