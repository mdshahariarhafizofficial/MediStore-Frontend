'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react';
import { sellerApi } from '@/lib/api/seller';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function SellerDashboard() {
  const { data: medicinesData } = useQuery({
    queryKey: ['seller-medicines'],
    queryFn: sellerApi.getMedicines,
  });

  const { data: ordersData } = useQuery({
    queryKey: ['seller-orders'],
    queryFn: sellerApi.getOrders,
  });

  if (!medicinesData || !ordersData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const medicines = medicinesData.data || [];
  const orders = ordersData.data || [];

  const totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
  const pendingOrders = orders.filter((order) => order.status === 'PLACED').length;
  const lowStockMedicines = medicines.filter((medicine) => medicine.stock < 10).length;

  const stats = [
    {
      title: 'Total Products',
      value: medicines.length.toString(),
      icon: Package,
      color: 'bg-blue-500',
    },
    {
      title: 'Total Orders',
      value: orders.length.toString(),
      icon: ShoppingBag,
      color: 'bg-green-500',
    },
    {
      title: 'Total Revenue',
      value: `৳${totalRevenue.toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-yellow-500',
    },
    {
      title: 'Pending Orders',
      value: pendingOrders.toString(),
      icon: TrendingUp,
      color: pendingOrders > 0 ? 'bg-red-500' : 'bg-purple-500',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600 mt-2">Manage your medicines and track orders</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.color} p-3 rounded-full`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Low Stock Alert */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Low Stock Medicines ({lowStockMedicines})
            </h2>
            {lowStockMedicines > 0 ? (
              <div className="space-y-3">
                {medicines
                  .filter((medicine) => medicine.stock < 10)
                  .slice(0, 5)
                  .map((medicine) => (
                    <div key={medicine.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                      <div>
                        <p className="font-medium">{medicine.name}</p>
                        <p className="text-sm text-gray-500">{medicine.manufacturer}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-red-600 font-bold">Stock: {medicine.stock}</p>
                        <p className="text-sm text-gray-500">Reorder required</p>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <p className="text-gray-500">All medicines are well-stocked.</p>
            )}
          </div>

          {/* Recent Orders */}
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Orders</h2>
            <div className="space-y-3">
              {orders.slice(0, 5).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium">Order #{order.orderNumber.slice(0, 8)}</p>
                    <p className="text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-primary-700">৳{order.totalAmount}</p>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      order.status === 'DELIVERED' ? 'bg-green-100 text-green-800' :
                      order.status === 'CANCELLED' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}