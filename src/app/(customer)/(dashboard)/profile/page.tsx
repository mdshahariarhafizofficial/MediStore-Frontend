'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, Mail, Phone, MapPin, Shield, 
  Package, Clock, CreditCard, LogOut,
  Edit, Save, X, ShoppingCart, Image as ImageIcon, Link as LinkIcon
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
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
  photoUrl: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
});

type ProfileFormData = z.infer<typeof profileSchema>;

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser, logout } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPhotoPreview, setShowPhotoPreview] = useState(false);

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
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || '',
      photoUrl: user?.photoUrl || '',
    },
  });

  // Watch photoUrl field for preview
  const photoUrlValue = watch('photoUrl');

  // Update form when user changes
  useEffect(() => {
    if (user) {
      reset({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        photoUrl: user.photoUrl || '',
      });
    }
  }, [user, reset]);

  const handleEditToggle = () => {
    if (isEditing) {
      reset({
        name: user?.name || '',
        email: user?.email || '',
        phone: user?.phone || '',
        address: user?.address || '',
        photoUrl: user?.photoUrl || '',
      });
      setShowPhotoPreview(false);
    }
    setIsEditing(!isEditing);
  };

  const onSubmit = async (data: ProfileFormData) => {
    setIsLoading(true);
    
    try {
      const payload = {
        name: data.name,
        phone: data.phone || null,
        address: data.address || null,
        photoUrl: data.photoUrl || null,
      };

      const response = await authApi.updateProfile(payload);

      if (response.success && response.data) {
        const currentStoredUser = JSON.parse(localStorage.getItem('medistore_user') || '{}');
        const updatedUser = {
          ...currentStoredUser,
          ...response.data,
          photoUrl: response.data.photoUrl
        };
        
        localStorage.setItem('medistore_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        reset({
          name: response.data.name,
          email: response.data.email,
          phone: response.data.phone || '',
          address: response.data.address || '',
          photoUrl: response.data.photoUrl || '',
        });

        toast.success('Profile updated successfully!');
        setIsEditing(false);
        setShowPhotoPreview(false);
        
        setTimeout(() => {
          window.location.reload();
        }, 500);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    authApi.logout();
    router.push('/login');
  };

  const orders = ordersData?.data || [];
  const stats = [
    { 
      label: 'Total Orders', 
      value: orders.length, 
      icon: Package, 
      color: 'text-blue-600 dark:text-blue-400',
      bg: 'bg-blue-50 dark:bg-blue-900/30'
    },
    { 
      label: 'Pending Orders', 
      value: orders.filter((o: any) => ['PLACED', 'PROCESSING', 'SHIPPED'].includes(o.status)).length, 
      icon: Clock, 
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-900/30'
    },
    { 
      label: 'Delivered', 
      value: orders.filter((o: any) => o.status === 'DELIVERED').length, 
      icon: Shield, 
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/30'
    },
    { 
      label: 'Total Spent', 
      value: `৳${orders.reduce((sum: number, order: any) => sum + order.totalAmount, 0).toLocaleString()}`,
      icon: CreditCard, 
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-900/30'
    },
  ];

  const clearProfilePhoto = () => {
    setValue('photoUrl', '');
  };

  const togglePhotoPreview = () => {
    setShowPhotoPreview(!showPhotoPreview);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-[#0a0a0a]">
        <LoadingSpinner size="lg" text="Loading profile..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] py-8 transition-colors duration-300">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white">My Profile</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 font-medium">Manage your personal settings, view order history, and control your account.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Main Profile Editor Card */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden border border-gray-100 dark:border-gray-800">
              
              {/* Premium Gradient Header over Profile Map */}
               <div className="h-32 w-full bg-gradient-to-r from-primary-600/80 to-blue-600/80 relative">
                 <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576602976047-17f1c6fe9549?w=800&q=80')] mix-blend-overlay bg-cover bg-center opacity-30"></div>
                 {/* Decorative elements */}
                 <div className="absolute bottom-[-1px] w-full h-8 bg-gradient-to-t from-white dark:from-gray-900 to-transparent"></div>
               </div>

              <div className="px-6 pb-6 sm:px-10 sm:pb-10 -mt-16 relative z-10">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 sm:mb-10 gap-4">
                  <div className="flex flex-col sm:flex-row sm:items-end gap-6">
                    {/* Profile Photo */}
                    <div className="relative group">
                      <div 
                        className="w-32 h-32 rounded-3xl flex items-center justify-center overflow-hidden border-4 border-white dark:border-gray-900 shadow-xl bg-gray-100 dark:bg-gray-800 transition-transform duration-300 group-hover:scale-105"
                        style={{
                          backgroundImage: user?.photoUrl ? `url('${user.photoUrl}')` : 'none',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                        }}
                      >
                        {!user?.photoUrl && (
                          <span className="text-gray-400 dark:text-gray-500 text-5xl font-extrabold uppercase drop-shadow-md">
                            {user?.name?.charAt(0)}
                          </span>
                        )}
                      </div>
                      {isEditing && photoUrlValue && showPhotoPreview && (
                        <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-lg whitespace-nowrap z-20">
                          Previewing
                        </div>
                      )}
                    </div>

                    <div className="mb-2">
                       <div className="flex items-center gap-3 mb-1">
                         <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white truncate">{user.name}</h2>
                         <span className="inline-block px-3 py-1 bg-primary-100 text-primary-800 dark:bg-primary-900/50 dark:text-primary-300 rounded-full text-xs font-bold uppercase tracking-widest border border-primary-200 dark:border-primary-800 lg:mb-1">
                           {user.role}
                         </span>
                       </div>
                      <p className="text-gray-500 dark:text-gray-400 font-medium break-all">{user.email}</p>
                    </div>
                  </div>

                  <button
                    onClick={handleEditToggle}
                    className={`flex items-center px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm ${isEditing ? 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700' : 'bg-primary-50 text-primary-700 hover:bg-primary-100 dark:bg-primary-900/30 dark:text-primary-400 dark:hover:bg-primary-900/50 border border-primary-200 dark:border-primary-800'}`}
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
                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Full Name
                      </label>
                      {isEditing ? (
                        <>
                          <input
                            type="text"
                            {...register('name')}
                            className={`w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 dark:text-white ${
                              errors.name ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700'
                            }`}
                          />
                          {errors.name && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">{errors.name.message}</p>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl">
                          <User className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                          <span className="text-gray-900 dark:text-white font-medium">{user.name}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Email Address
                      </label>
                      {isEditing ? (
                        <>
                          <input
                            type="email"
                            {...register('email')}
                            disabled
                            className={`w-full px-5 py-3.5 bg-gray-100 dark:bg-gray-800/80 border rounded-xl outline-none text-gray-600 dark:text-gray-400 cursor-not-allowed ${
                              errors.email ? 'border-red-500' : 'border-gray-200 dark:border-gray-700'
                            }`}
                          />
                          <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">Email address cannot be changed</p>
                        </>
                      ) : (
                        <div className="flex items-center p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl">
                          <Mail className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                          <span className="text-gray-900 dark:text-white font-medium">{user.email}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Phone Number
                      </label>
                      {isEditing ? (
                        <>
                          <input
                            type="tel"
                            {...register('phone')}
                            placeholder="+8801234567890"
                            className={`w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 dark:text-white ${
                              errors.phone ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700'
                            }`}
                          />
                          {errors.phone && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">{errors.phone.message}</p>
                          )}
                        </>
                      ) : (
                        <div className="flex items-center p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl">
                          <Phone className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3" />
                          <span className="text-gray-900 dark:text-white font-medium">{user.phone || 'Not provided'}</span>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                        Address
                      </label>
                      {isEditing ? (
                        <>
                          <textarea
                            {...register('address')}
                            rows={3}
                            placeholder="Enter your full address"
                            className={`w-full px-5 py-3.5 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 dark:text-white resize-none ${
                              errors.address ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700'
                            }`}
                          />
                          {errors.address && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">{errors.address.message}</p>
                          )}
                        </>
                      ) : (
                        <div className="flex items-start p-3.5 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl min-h-[58px]">
                          <MapPin className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-900 dark:text-white font-medium whitespace-pre-line leading-snug">
                            {user.address || 'Not provided'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Photo URL Field */}
                    <div className="md:col-span-2 pt-2">
                      <label className="flex items-center text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                        Profile Photo URL
                        <span className="text-gray-400 dark:text-gray-500 text-xs font-normal ml-2 tracking-wide uppercase">
                          (Optional)
                        </span>
                      </label>
                      
                      {isEditing ? (
                        <div className="space-y-4">
                          <div className="flex flex-col sm:flex-row gap-3">
                            <div className="relative flex-1 group">
                               <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors">
                                 <LinkIcon className="h-5 w-5" />
                               </div>
                              <input
                                type="url"
                                placeholder="https://example.com/photo.jpg"
                                {...register('photoUrl')}
                                className={`w-full pl-12 pr-4 py-3.5 bg-gray-50 dark:bg-gray-800 border rounded-xl focus:ring-4 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all text-gray-900 dark:text-white ${
                                  errors.photoUrl ? 'border-red-500 bg-red-50 dark:bg-red-900/10' : 'border-gray-200 dark:border-gray-700'
                                }`}
                              />
                            </div>
                            
                            {photoUrlValue && (
                              <button
                                type="button"
                                onClick={togglePhotoPreview}
                                className="px-6 py-3.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl font-bold transition-all whitespace-nowrap border border-gray-200 dark:border-gray-700 shadow-sm"
                              >
                                {showPhotoPreview ? 'Hide' : 'Show'} Preview
                              </button>
                            )}
                          </div>
                          
                          {errors.photoUrl && (
                             <p className="mt-2 text-sm text-red-600 dark:text-red-400 font-medium">{errors.photoUrl.message}</p>
                          )}

                          <div className="flex items-center justify-between mt-2 px-1 text-sm">
                            <span className="flex items-center text-gray-500 dark:text-gray-400">
                              <ImageIcon className="h-4 w-4 mr-2 opacity-50" />
                              Enter a direct image link (e.g. imgur, pravatar)
                            </span>
                            {photoUrlValue && (
                              <button
                                type="button"
                                onClick={clearProfilePhoto}
                                className="text-red-500 hover:text-red-600 dark:text-red-400 font-semibold"
                              >
                                Clear Link
                              </button>
                            )}
                          </div>

                          {/* Interactive Preview Notice */}
                          {showPhotoPreview && photoUrlValue && !errors.photoUrl && (
                            <div className="mt-5 p-5 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/50 rounded-2xl flex flex-col sm:flex-row items-center gap-6 animate-fade-in shadow-inner">
                              <div 
                                className="w-20 h-20 rounded-full bg-cover bg-center border-4 border-white dark:border-gray-800 shadow-md flex-shrink-0"
                                style={{ backgroundImage: `url(${photoUrlValue})` }}
                              />
                              <div className="text-center sm:text-left">
                                <h4 className="text-blue-800 dark:text-blue-400 font-bold mb-1">Previewing new photo</h4>
                                <p className="text-blue-600/80 dark:text-blue-500/80 text-sm font-medium">This image will be displayed on your profile and reviews once saved.</p>
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-2xl">
                           <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-xl mr-4 flex-shrink-0">
                             <ImageIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
                           </div>
                          <div className="min-w-0">
                            <h4 className="text-gray-900 dark:text-gray-200 font-semibold mb-0.5 truncate gap-2 flex items-center">
                              {user.photoUrl ? 'Avatar Linked' : 'No Avatar Assigned'}
                              {user.photoUrl && <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block"></span>}
                            </h4>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate w-[200px] sm:w-[400px]">
                              {user.photoUrl || 'Your profile currently uses an initial character.'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {isEditing && (
                    <div className="flex flex-col sm:flex-row justify-end gap-3 mt-10 pt-6 border-t border-gray-100 dark:border-gray-800">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleEditToggle}
                        className="w-full sm:w-auto px-8"
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        loading={isLoading}
                        className="w-full sm:w-auto px-8 shadow-lg shadow-primary-600/20"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  )}
                </form>
              </div>
            </div>

            {/* Quick Summary Widgets via Grid */}
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 pt-2">Shopping Overview</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats.map((stat, index) => (
                <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl p-5 shadow-sm border border-gray-100 dark:border-gray-800 hover:shadow-md transition-all group">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${stat.bg} group-hover:scale-110 transition-transform`}>
                    <stat.icon className={`h-5 w-5 ${stat.color}`} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-1">{stat.label}</p>
                    <p className="text-2xl font-extrabold text-gray-900 dark:text-white truncate" title={stat.value.toString()}>{stat.value}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* Right Column - Side Settings & Info */}
          <div className="lg:col-span-1 space-y-6">
            
            {/* Context Actions Card */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">Explore</h2>
              
              <div className="space-y-3">
                <Link href="/orders" className="block group">
                  <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-transparent hover:border-blue-200 dark:hover:border-blue-900/50 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all">
                    <div className="flex items-center">
                      <div className="p-2.5 bg-blue-100 dark:bg-blue-900/40 rounded-xl mr-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/60 transition-colors">
                        <ShoppingCart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 dark:text-white text-sm">Order History</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Track your packages</p>
                      </div>
                    </div>
                    <span className="text-gray-400 dark:text-gray-500 font-bold group-hover:translate-x-1 transition-transform">→</span>
                  </div>
                </Link>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-transparent hover:border-purple-200 dark:hover:border-purple-900/50 hover:bg-purple-50/50 dark:hover:bg-purple-900/20 transition-all cursor-pointer group">
                  <div className="flex items-center">
                    <div className="p-2.5 bg-purple-100 dark:bg-purple-900/40 rounded-xl mr-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/60 transition-colors">
                      <CreditCard className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">Payment Methods</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Manage your cards</p>
                    </div>
                  </div>
                  <span className="text-gray-400 dark:text-gray-500 font-bold group-hover:translate-x-1 transition-transform">→</span>
                </div>

                 <div className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 dark:bg-gray-800/50 border border-transparent hover:border-yellow-200 dark:hover:border-yellow-900/50 hover:bg-yellow-50/50 dark:hover:bg-yellow-900/20 transition-all cursor-pointer group">
                  <div className="flex items-center">
                    <div className="p-2.5 bg-yellow-100 dark:bg-yellow-900/40 rounded-xl mr-3 group-hover:bg-yellow-200 dark:group-hover:bg-yellow-900/60 transition-colors">
                      <Shield className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">Security</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">Change password</p>
                    </div>
                  </div>
                  <span className="text-gray-400 dark:text-gray-500 font-bold group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>

              {/* Logout Area */}
              <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-800">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center p-3.5 rounded-xl font-bold bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors shadow-sm"
                >
                  <LogOut className="h-5 w-5 mr-2 stroke-[2.5]" />
                  Sign Out Securely
                </button>
              </div>
            </div>

            {/* Quick Info Card */}
            <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 sm:p-8">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-6 flex items-center">
                 <Shield className="h-5 w-5 mr-2 text-primary-500" />
                 Account Details
              </h3>
              
              <div className="space-y-4">
                 <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Member Since</span>
                    <span className="font-bold text-gray-900 dark:text-gray-300">
                      {new Date(user.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </span>
                 </div>
                 
                 <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Type</span>
                    <span className={`px-2.5 py-1 rounded text-xs font-bold uppercase tracking-widest bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300`}>
                       {user.role}
                    </span>
                 </div>
                 
                 <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800 last:border-0 last:pb-0">
                    <span className="text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</span>
                    <div className={`flex items-center px-2.5 py-1 rounded bg-green-50 dark:bg-green-900/30 border border-green-100 dark:border-green-800/50`}>
                       <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                       <span className="text-xs font-bold uppercase tracking-widest text-green-700 dark:text-green-400">
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