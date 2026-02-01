'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { User, Mail, Lock, Phone, MapPin, Eye, EyeOff, Package } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/auth.store';

const registerSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters'),
  email: z.string()
    .email('Please enter a valid email address')
    .max(100, 'Email must be less than 100 characters'),
  password: z.string()
    .min(6, 'Password must be at least 6 characters')
    .max(50, 'Password must be less than 50 characters'),
  confirmPassword: z.string(),
  role: z.enum(['CUSTOMER', 'SELLER'], {
    required_error: 'Please select an account type',
  }),
  phone: z.string()
    .optional()
    .refine(val => !val || /^[+]?[0-9]{10,15}$/.test(val), {
      message: 'Please enter a valid phone number',
    }),
  address: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { login, isAuthenticated } = useAuthStore();

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      role: 'CUSTOMER',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.register({
        name: data.name,
        email: data.email,
        password: data.password,
        role: data.role,
        phone: data.phone,
        address: data.address,
      });

      if (response.success) {
        login(response.data.user, response.data.token);
        toast.success('Account created successfully! Welcome to MediStore.');
        
        // Redirect based on role
        setTimeout(() => {
          if (data.role === 'SELLER') {
            router.push('/seller/dashboard');
          } else {
            router.push('/');
          }
        }, 500);
      }
    } catch (error: any) {
      console.error('Registration error:', error);
      const message = error.errors?.[0]?.message || error.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl flex items-center justify-center shadow-lg">
              <Package className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900">Create Your Account</h1>
          <p className="text-gray-600 mt-2">Join MediStore and experience hassle-free healthcare</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="md:grid md:grid-cols-2">
            {/* Left Side - Form */}
            <div className="p-8">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                {/* Name */}
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="John Doe"
                  icon={<User className="h-5 w-5" />}
                  error={errors.name?.message}
                  {...register('name')}
                />

                {/* Email */}
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  icon={<Mail className="h-5 w-5" />}
                  error={errors.email?.message}
                  {...register('email')}
                />

                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      icon={<Lock className="h-5 w-5" />}
                      error={errors.password?.message}
                      {...register('password')}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      icon={<Lock className="h-5 w-5" />}
                      error={errors.confirmPassword?.message}
                      {...register('confirmPassword')}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Account Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {(['CUSTOMER', 'SELLER'] as const).map((role) => (
                      <label
                        key={role}
                        className={`
                          flex items-center p-4 rounded-xl border cursor-pointer transition-all duration-200
                          ${selectedRole === role
                            ? 'border-primary-500 bg-primary-50 ring-2 ring-primary-500 ring-opacity-20'
                            : 'border-gray-300 hover:border-gray-400'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          value={role}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                          {...register('role')}
                        />
                        <div className="ml-4">
                          <span className="text-sm font-medium text-gray-900">
                            {role === 'CUSTOMER' ? 'Customer' : 'Seller'}
                          </span>
                          <p className="text-xs text-gray-500 mt-1">
                            {role === 'CUSTOMER' 
                              ? 'Buy medicines for personal use' 
                              : 'Sell medicines on our platform'
                            }
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.role && (
                    <p className="mt-2 text-sm text-error-600">{errors.role.message}</p>
                  )}
                </div>

                {/* Phone (Optional) */}
                <Input
                  label="Phone Number (Optional)"
                  type="tel"
                  placeholder="+880 1234 567890"
                  icon={<Phone className="h-5 w-5" />}
                  error={errors.phone?.message}
                  {...register('phone')}
                />

                {/* Address (Optional) */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Address (Optional)
                  </label>
                  <div className="relative">
                    <textarea
                      className="w-full px-4 py-2.5 pl-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      rows={3}
                      placeholder="Enter your full address"
                      {...register('address')}
                    />
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-center">
                  <input
                    id="terms"
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    required
                  />
                  <label htmlFor="terms" className="ml-3 text-sm text-gray-700">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary-600 hover:text-primary-500 font-medium">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary-600 hover:text-primary-500 font-medium">
                      Privacy Policy
                    </Link>
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  loading={isLoading}
                  fullWidth
                  size="lg"
                  className="mt-4"
                >
                  Create Account
                </Button>
              </form>

              {/* Login Link */}
              <div className="mt-8 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className="font-semibold text-primary-600 hover:text-primary-500"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>

            {/* Right Side - Info */}
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-8 text-white">
              <div className="h-full flex flex-col justify-center">
                <h2 className="text-2xl font-bold mb-6">Why Join MediStore?</h2>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Package className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Wide Selection</h3>
                      <p className="text-sm text-white/80">10,000+ authentic medicines from trusted brands</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">Fast Delivery</h3>
                      <p className="text-sm text-white/80">Same-day delivery in major cities across Bangladesh</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">100% Secure</h3>
                      <p className="text-sm text-white/80">Verified medicines and secure payment options</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center flex-shrink-0">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">24/7 Support</h3>
                      <p className="text-sm text-white/80">Always available to help with your queries</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t border-white/20">
                  <p className="text-sm text-white/80">
                    Join 50,000+ satisfied customers who trust us with their health
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}