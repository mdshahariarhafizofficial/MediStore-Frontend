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
import { sellerApi } from '@/lib/api/seller';

export default function SellerDashboardPage() {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();

  // Redirect if not authenticated as seller
  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'SELLER') {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  // Fetch seller data
  const { data: medicinesData } = useQuery({
    queryKey: ['seller-medicines'],
    queryFn: () => sellerApi.getMedicines(),
    enabled: isAuthenticated && user?.role === 'SELLER',
  });

  const { data: ordersData } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: () => sellerApi.getOrders(),
    enabled: isAuthenticated && user?.role === 'SELLER',
  });

  const medicines = medicinesData?.data || [];
  const orders = ordersData?.data || [];

  // Calculate stats from real data
  const stats = [
    { 
      label: 'Total Products', 
      value: medicines.length, 
      icon: Package,
      color: 'blue',
      link: '/seller/medicines'
    },
    { 
      label: 'Total Revenue', 
      value: `৳${orders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()}`, 
      icon: DollarSign,
      color: 'green',
      link: '/seller/orders'
    },
    { 
      label: 'Total Orders', 
      value: orders.length, 
      icon: ShoppingCart,
      color: 'purple',
      link: '/seller/orders'
    },
    { 
      label: 'Active Customers', 
      value: new Set(orders.map(order => order.customerId)).size,
      icon: Users,
      color: 'orange',
      link: '#'
    },
  ];

  const recentOrders = orders.slice(0, 4).map(order => ({
    id: order.orderNumber,
    customer: order.customer?.name || 'Unknown',
    amount: `৳${order.totalAmount}`,
    status: order.status,
    time: new Date(order.createdAt).toLocaleDateString('en-BD', {
      day: 'numeric',
      month: 'short',
    }),
  }));

  // Calculate top products
  const productSales: Record<string, { sales: number; revenue: number }> = {};
  orders.forEach(order => {
    order.items.forEach(item => {
      if (!productSales[item.medicine.name]) {
        productSales[item.medicine.name] = { sales: 0, revenue: 0 };
      }
      productSales[item.medicine.name].sales += item.quantity;
      productSales[item.medicine.name].revenue += item.price * item.quantity;
    });
  });

  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1].sales - a[1].sales)
    .slice(0, 4)
    .map(([name, data]) => ({
      name,
      sales: data.sales,
      revenue: `৳${data.revenue.toLocaleString()}`,
    }));

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
                      <th className="text-left py-3 text-sm font-medium text-gray-500">Date</th>
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
                  <Button className="w-full mt-4 border-white hover:bg-white/10 px-8 hover:text-white">
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
                  <Button className="w-full mt-4 border-white/30 hover:bg-white/10 px-8 hover:text-white">
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
                  <span className="text-2xl font-bold text-gray-900">
                    {orders.filter(o => o.status === 'PROCESSING').length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Delivered Today</p>
                      <p className="text-sm text-gray-500">Orders delivered</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {orders.filter(o => o.status === 'DELIVERED' && 
                      new Date(o.createdAt).toDateString() === new Date().toDateString()).length}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-yellow-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Low Stock</p>
                      <p className="text-sm text-gray-500">Products to restock</p>
                    </div>
                  </div>
                  <span className="text-2xl font-bold text-gray-900">
                    {medicines.filter(m => m.stock < 10).length}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-r from-primary-600 to-primary-700 rounded-2xl p-6 text-white mt-6">
              <h3 className="font-bold text-lg mb-4">Store Performance</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span>Conversion Rate</span>
                  <span className="font-bold">
                    {orders.length > 0 ? `${Math.min(100, (orders.length / 100) * 100).toFixed(1)}%` : '0%'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Avg. Order Value</span>
                  <span className="font-bold">
                    ৳{orders.length > 0 ? (orders.reduce((sum, order) => sum + order.totalAmount, 0) / orders.length).toFixed(0) : '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span>Order Success Rate</span>
                  <span className="font-bold">
                    {orders.length > 0 ? 
                      ((orders.filter(o => o.status === 'DELIVERED').length / orders.length) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>
              <div className="mt-6 pt-6 border-t border-white/20">
                <p className="text-sm text-primary-100">
                  Last updated: {new Date().toLocaleTimeString('en-BD', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}