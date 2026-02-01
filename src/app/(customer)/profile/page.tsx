'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, Mail, Phone, MapPin, Shield, 
  Package, Clock, CreditCard, LogOut,
  Edit, Save, X, ShoppingCart
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api/auth';
import { orderApi } from '@/lib/api/order';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, logout, setUser } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch user orders for stats
  const { data: ordersData } = useQuery({
    queryKey: ['orders'],
    queryFn: () => orderApi.getUserOrders(),
    enabled: !!user,
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
    },
  });

  const handleEditToggle = () => {
    if (isEditing) {
      reset();
    }
    setIsEditing(!isEditing);
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    try {
      // Update user profile (In a real app, you would call an API)
      // Since we don't have a dedicated update profile API, we'll update the store
      const updatedUser = {
        ...user,
        ...data,
      };
      
      // Update in store
      setUser(updatedUser);
      
      // Update in localStorage
      localStorage.setItem('medistore_user', JSON.stringify(updatedUser));
      
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    authApi.logout();
    router.push('/login');
  };

  // Calculate stats from real data
  const orders = ordersData?.data || [];
  const stats = [
    { 
      label: 'Total Orders', 
      value: orders.length, 
      icon: Package, 
      color: 'blue' 
    },
    { 
      label: 'Pending Orders', 
      value: orders.filter(o => ['PLACED', 'PROCESSING', 'SHIPPED'].includes(o.status)).length, 
      icon: Clock, 
      color: 'yellow' 
    },
    { 
      label: 'Delivered Orders', 
      value: orders.filter(o => o.status === 'DELIVERED').length, 
      icon: Shield, 
      color: 'green' 
    },
    { 
      label: 'Total Spent', 
      value: `৳${orders.reduce((sum, order) => sum + order.totalAmount, 0).toLocaleString()}`,
      icon: CreditCard, 
      color: 'purple' 
    },
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-50 text-blue-600';
      case 'yellow': return 'bg-yellow-50 text-yellow-600';
      case 'green': return 'bg-green-50 text-green-600';
      case 'purple': return 'bg-purple-50 text-purple-600';
      default: return 'bg-gray-50 text-gray-600';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-2">Manage your account and preferences</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2">
            {/* Profile Card */}
            <div className="bg-white rounded-2xl shadow-sm p-6 mb-6">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center space-x-4">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{user.name}</h2>
                    <p className="text-gray-600">{user.email}</p>
                    <span className="inline-block mt-2 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm font-medium capitalize">
                      {user.role.toLowerCase()}
                    </span>
                  </div>
                </div>
                <button
                  onClick={handleEditToggle}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {isEditing ? (
                    <>
                      <X className="h-4 w-4 mr-2" />
                      Cancel
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </>
                  )}
                </button>
              </div>

              {/* Profile Form */}
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="text"
                          {...register('name')}
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                            errors.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.name && (
                          <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <User className="h-5 w-5 text-gray-400 mr-3" />
                        <span>{user.name}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    {isEditing ? (
                      <>
                        <input
                          type="email"
                          {...register('email')}
                          disabled
                          className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-gray-50 ${
                            errors.email ? 'border-red-500' : 'border-gray-300'
                          }`}
                        />
                        {errors.email && (
                          <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                        )}
                      </>
                    ) : (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Mail className="h-5 w-5 text-gray-400 mr-3" />
                        <span>{user.email}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        {...register('phone')}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                        <Phone className="h-5 w-5 text-gray-400 mr-3" />
                        <span>{user.phone || 'Not provided'}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    {isEditing ? (
                      <textarea
                        {...register('address')}
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      />
                    ) : (
                      <div className="flex items-start p-3 bg-gray-50 rounded-lg">
                        <MapPin className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                        <span className="whitespace-pre-line">
                          {user.address || 'Not provided'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {isEditing && (
                  <div className="flex justify-end space-x-3 mt-8 pt-6 border-t border-gray-200">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleEditToggle}
                    >
                      Cancel
                  </Button>
                    <Button
                      type="submit"
                      loading={isLoading}
                    >
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                )}
              </form>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-500">{stat.label}</p>
                      <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                    </div>
                    <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(stat.color)}`}>
                      <stat.icon className="h-6 w-6" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Column - Account Actions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 sticky top-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Account Actions</h2>

              <div className="space-y-4">
                <Link href="/orders" className="block">
                  <div className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50 cursor-pointer">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mr-4">
                        <ShoppingCart className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-gray-900">My Orders</p>
                        <p className="text-sm text-gray-500">View all orders</p>
                      </div>
                    </div>
                    <span className="text-gray-400">→</span>
                  </div>
                </Link>

                <button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center mr-4">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Security</p>
                      <p className="text-sm text-gray-500">Change password</p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>

                <button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-purple-50 rounded-lg flex items-center justify-center mr-4">
                      <CreditCard className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Payment Methods</p>
                      <p className="text-sm text-gray-500">Manage payment</p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>

                <button className="w-full flex items-center justify-between p-4 rounded-xl border border-gray-200 hover:bg-gray-50">
                  <div className="flex items-center">
                    <div className="w-10 h-10 bg-yellow-50 rounded-lg flex items-center justify-center mr-4">
                      <Shield className="h-5 w-5 text-yellow-600" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-gray-900">Privacy</p>
                      <p className="text-sm text-gray-500">Privacy settings</p>
                    </div>
                  </div>
                  <span className="text-gray-400">→</span>
                </button>
              </div>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                className="w-full mt-8 flex items-center justify-center p-4 rounded-xl border border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
              >
                <LogOut className="h-5 w-5 mr-3" />
                Sign Out
              </button>

              {/* Account Info */}
              <div className="mt-8 pt-6 border-t border-gray-200">
                <h3 className="font-medium text-gray-900 mb-3">Account Information</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Member since</span>
                    <span className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Account Type</span>
                    <span className="font-medium capitalize">{user.role.toLowerCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Account Status</span>
                    <span className={`font-medium ${user.isActive ? 'text-green-600' : 'text-red-600'}`}>
                      {user.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}