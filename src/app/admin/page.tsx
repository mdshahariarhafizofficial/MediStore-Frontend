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
  TrendingUp,
  RefreshCw,
  MoreVertical,
  Activity,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { adminApi } from '@/lib/api/admin';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/store/auth.store';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Order, Category } from '@/lib/types';

export default function AdminDashboard() {
  const { user, isAuthenticated } = useAuthStore();
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

  const refetchAll = () => {
    refetchUsers();
    refetchOrders();
    refetchCategories();
  };

  const isLoading = usersLoading || ordersLoading || categoriesLoading;
  const hasError = usersError || ordersError || categoriesError;

  const users: User[] = usersResponse?.data || [];
  const orders: Order[] = ordersResponse?.data || [];
  const categories: Category[] = categoriesResponse?.data || [];

  const totalRevenue = orders.reduce((sum: number, order: Order) => 
    sum + (order.totalAmount || 0), 0
  );
  
  const activeUsers = users.filter((u: User) => u.isActive).length;
  const pendingOrders = orders.filter((order: Order) => 
    order.status === 'PLACED' || order.status === 'PROCESSING'
  ).length;
  
  const deliveredOrders = orders.filter((order: Order) => 
    order.status === 'DELIVERED'
  ).length;

  const stats = [
    {
      title: 'Total Revenue',
      value: `৳${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      color: 'text-emerald-600 dark:text-emerald-400',
      bgRaw: 'bg-emerald-500',
      bg: 'bg-emerald-50 dark:bg-emerald-900/30',
      border: 'border-emerald-100 dark:border-emerald-800/50',
      trend: { value: '+12.5%', isUp: true },
    },
    {
      title: 'Active Users',
      value: activeUsers.toLocaleString(),
      icon: Users,
      color: 'text-blue-600 dark:text-blue-400',
      bgRaw: 'bg-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/30',
      border: 'border-blue-100 dark:border-blue-800/50',
      trend: { value: '+5.2%', isUp: true },
    },
    {
      title: 'Total Orders',
      value: orders.length.toLocaleString(),
      icon: ShoppingBag,
      color: 'text-indigo-600 dark:text-indigo-400',
      bgRaw: 'bg-indigo-500',
      bg: 'bg-indigo-50 dark:bg-indigo-900/30',
      border: 'border-indigo-100 dark:border-indigo-800/50',
      trend: { value: '+18.1%', isUp: true },
    },
    {
      title: 'Pending Orders',
      value: pendingOrders.toLocaleString(),
      icon: AlertCircle,
      color: 'text-amber-600 dark:text-amber-400',
      bgRaw: 'bg-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-900/30',
      border: 'border-amber-100 dark:border-amber-800/50',
      trend: { value: '-2.4%', isUp: false },
    },
  ];

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

  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'DELIVERED': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border border-green-200 dark:border-green-800';
      case 'CANCELLED': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800';
      case 'SHIPPED': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-200 dark:border-blue-800';
      case 'PROCESSING': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800';
      case 'PLACED': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400 border border-gray-200 dark:border-gray-700';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role?.toUpperCase()) {
      case 'ADMIN': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400';
      case 'SELLER': return 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="xl" text="Loading dashboard data..." />
      </div>
    );
  }

  if (hasError) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 flex items-center justify-center">
        <div className="text-center max-w-md p-10 bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full mb-6">
            <AlertCircle className="h-10 w-10 text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">Failed to Load Data</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            Unable to fetch dashboard statistics. Please check your connection.
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={refetchAll}
              className="w-full px-6 py-3.5 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
            >
              Retry Connection
            </button>
            <Link
              href="/"
              className="w-full px-6 py-3.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-600"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || user?.role !== 'ADMIN') {
    return null; // Ensure useEffect handles the redirection seamlessly without flash
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] py-8 transition-colors duration-300">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white">Admin Dashboard</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1.5 flex items-center">
              Welcome back, <span className="font-semibold text-primary-600 dark:text-primary-400 ml-1">{user?.name}</span> 👋
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={refetchAll}
              className="p-2.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/50"
              title="Refresh Data"
            >
              <RefreshCw className="h-5 w-5" />
            </button>
            <Link
              href="/admin/users"
              className="px-5 py-2.5 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 font-semibold rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shadow-sm"
            >
              Users
            </Link>
            <Link
              href="/admin/orders"
              className="px-5 py-2.5 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-600/20"
            >
              All Orders
            </Link>
          </div>
        </div>

        {/* KPI Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, idx) => (
            <div key={idx} className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md hover:-translate-y-1 transition-all duration-300 group">
              <div className="flex justify-between items-start mb-4">
                <div className={`p-3 rounded-xl ${stat.bg} ${stat.border} border transition-colors group-hover:scale-110 duration-300`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
                <span className={`flex items-center text-xs font-bold px-2.5 py-1 rounded-full ${stat.trend.isUp ? 'text-green-700 bg-green-50 dark:bg-green-900/30 dark:text-green-400' : 'text-red-700 bg-red-50 dark:bg-red-900/30 dark:text-red-400'}`}>
                  {stat.trend.isUp ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
                  {stat.trend.value}
                </span>
              </div>
              <div>
                <h3 className="text-gray-500 dark:text-gray-400 text-sm font-semibold uppercase tracking-wider mb-1">{stat.title}</h3>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{stat.value}</h2>
              </div>
            </div>
          ))}
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column (Span 2) */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Recent Orders Table */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                <div className="flex items-center">
                  <ShoppingBag className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2.5" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Orders</h2>
                </div>
                <Link href="/admin/orders" className="text-sm font-semibold text-primary-600 dark:text-primary-400 hover:text-primary-700 hover:underline">
                  View All
                </Link>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-white dark:bg-gray-900 text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 font-semibold border-b border-gray-100 dark:border-gray-800">
                      <th className="px-6 py-4">Order ID</th>
                      <th className="px-6 py-4">Customer</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                    {orders.slice(0, 6).map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-200">
                            #{order.orderNumber?.substring(0, 8) || order.id.substring(0, 8)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                             <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900/40 rounded-full flex items-center justify-center text-primary-700 dark:text-primary-400 font-bold text-xs mr-3">
                               {order.customer?.name?.charAt(0) || 'C'}
                             </div>
                             <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                               {order.customer?.name || 'Guest User'}
                             </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900 dark:text-gray-200">
                          ৳{(order.totalAmount || 0).toFixed(2)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${getStatusBadge(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Performance Analytics visualization (Faked via CSS bars) */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2.5" />
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white">Order Performance (Last 7 Days)</h2>
                </div>
              </div>
              <div className="flex items-end space-x-2 sm:space-x-4 h-64 w-full">
                {/* CSS Based Bar Chart */}
                {[45, 60, 30, 80, 55, 90, 75].map((val, idx) => (
                  <div key={idx} className="flex-1 flex flex-col items-center group relative">
                    {/* Tooltip */}
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-10 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-xs font-bold py-1 px-2 rounded whitespace-nowrap shadow-lg">
                      {val} Orders
                    </div>
                    {/* Bar */}
                    <div className="w-full relative h-[100%] bg-gray-100 dark:bg-gray-800 rounded-t-lg overflow-hidden">
                       <div 
                         className="absolute bottom-0 w-full rounded-t-lg bg-gradient-to-t from-primary-600 to-primary-400 transition-all duration-1000 ease-out group-hover:brightness-110" 
                         style={{ height: `${val}%` }}
                       ></div>
                    </div>
                    {/* Label */}
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 mt-3 whitespace-nowrap">
                      Day {idx + 1}
                    </span>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column (Span 1) */}
          <div className="space-y-8">
            
            {/* Category Distribution */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Categories</h2>
                <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                  <Package className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                </div>
              </div>
              
              <div className="flex items-end justify-between mb-2">
                <span className="text-3xl font-extrabold text-gray-900 dark:text-white">{categories.length}</span>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1.5">Total Registered</span>
              </div>
              
              <div className="space-y-4 mt-6">
                {categories.slice(0, 5).map((category, idx) => {
                  const maxCount = Math.max(...categories.map(c => c._count?.medicines || 0));
                  const percentage = maxCount ? ((category._count?.medicines || 0) / maxCount) * 100 : 0;
                  
                  return (
                  <div key={category.id}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-semibold text-gray-700 dark:text-gray-300">{category.name}</span>
                      <span className="text-gray-500 dark:text-gray-400 font-medium">{category._count?.medicines || 0} items</span>
                    </div>
                    <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
                      <div className="bg-primary-500 h-2 rounded-full" style={{ width: `${Math.max(percentage, 5)}%` }}></div>
                    </div>
                  </div>
                )})}
              </div>
              
              <Link href="/admin/categories" className="mt-6 flex items-center justify-center w-full py-3 bg-gray-50 dark:bg-gray-800 text-sm font-semibold text-primary-600 dark:text-primary-400 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                Manage All Categories
              </Link>
            </div>

            {/* Recent Users List */}
            <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 overflow-hidden">
               <div className="px-6 py-5 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/50">
                <h2 className="text-lg font-bold text-gray-900 dark:text-white">Recent Users</h2>
                <Link href="/admin/users" className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors">
                  <MoreVertical className="h-5 w-5" />
                </Link>
              </div>
              <div className="p-6 space-y-5">
                {users.slice(0, 5).map((userItem) => (
                  <div key={userItem.id} className="flex items-center justify-between group cursor-pointer">
                    <div className="flex items-center space-x-3">
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800 flex items-center justify-center font-bold text-gray-700 dark:text-gray-300 group-hover:scale-105 transition-transform">
                         {userItem.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-sm text-gray-900 dark:text-white">{userItem.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[120px]">{userItem.email}</p>
                      </div>
                    </div>
                    <div className={`px-2.5 py-1 rounded border text-[10px] font-bold tracking-widest uppercase ${getRoleBadge(userItem.role)}`}>
                       {userItem.role}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}