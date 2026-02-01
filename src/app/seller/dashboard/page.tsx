'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Package, TrendingUp, Users, DollarSign, 
  ShoppingCart, Clock, CheckCircle, AlertTriangle,
  ArrowRight, BarChart3, Calendar
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/store/auth.store';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  // Redirect if not authenticated as seller
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'SELLER') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  // Mock data for seller dashboard
  const stats = [
    { 
      label: 'Total Products', 
      value: '45', 
      change: '+12%', 
      icon: Package,
      color: 'blue',
      link: '/seller/medicines'
    },
    { 
      label: 'Total Revenue', 
      value: '৳12,450', 
      change: '+18%', 
      icon: DollarSign,
      color: 'green',
      link: '/seller/orders'
    },
    { 
      label: 'Total Orders', 
      value: '156', 
      change: '+8%', 
      icon: ShoppingCart,
      color: 'purple',
      link: '/seller/orders'
    },
    { 
      label: 'Active Customers', 
      value: '89', 
      change: '+5%', 
      icon: Users,
      color: 'orange',
      link: '#'
    },
  ];

  const recentOrders = [
    { id: 1, customer: 'John Doe', amount: '৳450', status: 'Processing', time: '2 hours ago' },
    { id: 2, customer: 'Jane Smith', amount: '৳320', status: 'Shipped', time: '5 hours ago' },
    { id: 3, customer: 'Bob Johnson', amount: '৳780', status: 'Delivered', time: '1 day ago' },
    { id: 4, customer: 'Alice Brown', amount: '৳230', status: 'Placed', time: '2 days ago' },
  ];

  const topProducts = [
    { name: 'Paracetamol 500mg', sales: 45, revenue: '৳1,350' },
    { name: 'Vitamin C 1000mg', sales: 32, revenue: '৳2,048' },
    { name: 'Cetirizine 10mg', sales: 28, revenue: '৳896' },
    { name: 'Omeprazole 20mg', sales: 24, revenue: '৳1,200' },
  ];

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'processing': return 'bg-yellow-100 text-yellow-800';
      case 'shipped': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'placed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!isAuthenticated || user?.role !== 'SELLER') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading dashboard..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600 mt-2">Welcome back, {user?.name}! Here's what's happening with your store.</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Link key={index} href={stat.link}>
              <div className="bg-white rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    stat.color === 'blue' ? 'bg-blue-50 text-blue-600' :
                    stat.color === 'green' ? 'bg-green-50 text-green-600' :
                    stat.color === 'purple' ? 'bg-purple-50 text-purple-600' :
                    'bg-orange-50 text-orange-600'
                  }`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <span className={`text-sm font-medium ${
                    stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {stat.change}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
                <p className="text-gray-600">{stat.label}</p>
              </div>
            </Link>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Orders */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 text-gray-400 mr-3" />
                  <h2 className="text-xl font-bold text-gray-900">Recent Orders</h2>
                </div>
                <Link href="/seller/orders" className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                  View All →
                </Link>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 text-sm font-medium text-gray-500">Order ID</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-500">Customer</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-500">Amount</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-500">Status</th>
                      <th className="text-left py-3 text-sm font-medium text-gray-500">Time</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="border-b border-gray-100 last:border-0">
                        <td className="py-4">
                          <span className="font-medium text-gray-900">#{order.id}</span>
                        </td>
                        <td className="py-4">
                          <span className="text-gray-900">{order.customer}</span>
                        </td>
                        <td className="py-4">
                          <span className="font-medium text-gray-900">{order.amount}</span>
                        </td>
                        <td className="py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4">
                          <span className="text-gray-500 text-sm">{order.time}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {recentOrders.length === 0 && (
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No recent orders</p>
                </div>
              )}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
              <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <Package className="h-8 w-8 mb-2" />
                    <h3 className="text-xl font-bold">Add New Product</h3>
                    <p className="text-blue-100 mt-1">List a new medicine for sale</p>
                  </div>
                </div>
                <Link href="/seller/medicines">
                  <Button className="w-full mt-4 bg-white text-blue-600 hover:bg-blue-50">
                    Add Product
                  </Button>
                </Link>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <BarChart3 className="h-8 w-8 mb-2" />
                    <h3 className="text-xl font-bold">View Analytics</h3>
                    <p className="text-green-100 mt-1">Track your store performance</p>
                  </div>
                </div>
                <Link href="#">
                  <Button className="w-full mt-4 bg-white text-green-600 hover:bg-green-50">
                    View Analytics
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-1">
            {/* Top Products */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <TrendingUp className="h-5 w-5 text-gray-400 mr-3" />
                  <h2 className="text-xl font-bold text-gray-900">Top Products</h2>
                </div>
              </div>
              
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.sales} units sold</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{product.revenue}</p>
                      <p className="text-sm text-green-600">+12%</p>
                    </div>
                  </div>
                ))}
              </div>

              {topProducts.length === 0 && (
                <div className="text-center py-8">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No products yet</p>
                </div>
              )}
            </div>

            {/* Status Overview */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center mb-6">
                <Calendar className="h-5 w-5 text-gray-400 mr-3" />
                <h2 className="text-xl font-bold text-gray-900">Today's Overview</h2>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-blue-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Processing</p>
                      <p className="text-sm text-gray-500">Orders being prepared</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">4</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Ready to Ship</p>
                      <p className="text-sm text-gray-500">Orders packed</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">2</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Low Stock</p>
                      <p className="text-sm text-gray-500">Products to restock</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">3</span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white mt-6">
              <h3 className="font-bold text-lg mb-4">Store Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Conversion Rate</span>
                  <span className="font-bold">4.8%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Avg. Order Value</span>
                  <span className="font-bold">৳320</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Customer Rating</span>
                  <span className="font-bold">4.7/5</span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-sm text-primary-100">
                  Last updated: Today, 2:30 PM
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}