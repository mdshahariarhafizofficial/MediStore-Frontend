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

  if (isAuthenticated) return null;

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
       {/* Background Decorative Elements */}
       <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-100 dark:bg-primary-900/20 blur-3xl opacity-50 pointer-events-none"></div>
       <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100 dark:bg-blue-900/20 blur-3xl opacity-50 pointer-events-none"></div>

      <div className="w-full max-w-5xl relative z-10">
        <div className="bg-white dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-700">
          <div className="lg:grid lg:grid-cols-[1.3fr_1fr]">
            {/* Left Side - Form */}
            <div className="p-8 sm:p-12 relative">
               <div className="text-center mb-10 lg:hidden">
                 <Link href="/" className="inline-flex items-center justify-center p-3 mb-4 bg-gradient-to-br from-primary-500 to-primary-700 rounded-2xl shadow-lg">
                   <Package className="h-6 w-6 text-white" />
                 </Link>
                 <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">Create Account</h1>
                 <p className="text-gray-600 dark:text-gray-400 mt-2">Join MediStore today</p>
               </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  {/* Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Password
                    </label>
                    <div className="relative group">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        icon={<Lock className="h-5 w-5" />}
                        error={errors.password?.message}
                        {...register('password')}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Confirm Password
                    </label>
                    <div className="relative group">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="••••••••"
                        icon={<Lock className="h-5 w-5" />}
                        error={errors.confirmPassword?.message}
                        {...register('confirmPassword')}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Account Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    Account Type
                  </label>
                  <div className="grid grid-cols-2 gap-4">
                    {(['CUSTOMER', 'SELLER'] as const).map((role) => (
                      <label
                        key={role}
                        className={`
                          flex flex-col sm:flex-row items-center p-4 rounded-2xl border cursor-pointer transition-all duration-300 text-center sm:text-left
                          ${selectedRole === role
                            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-2 ring-primary-500 border-transparent box-border dark:border-primary-500 shadow-md scale-[1.02]'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-500 bg-gray-50 dark:bg-gray-900'
                          }
                        `}
                      >
                        <input
                          type="radio"
                          value={role}
                          className="hidden"
                          {...register('role')}
                        />
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mr-0 sm:mr-4 mb-2 sm:mb-0 transition-colors ${selectedRole === role ? 'border-primary-500' : 'border-gray-300 dark:border-gray-600'}`}>
                           <div className={`w-2.5 h-2.5 rounded-full bg-primary-500 scale-0 transition-transform ${selectedRole === role ? 'scale-100' : ''}`}></div>
                        </div>
                        <div>
                          <span className={`block text-sm font-bold ${selectedRole === role ? 'text-primary-700 dark:text-primary-400' : 'text-gray-900 dark:text-white'}`}>
                            {role === 'CUSTOMER' ? 'Customer' : 'Seller'}
                          </span>
                          <span className="block text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            {role === 'CUSTOMER' ? 'Buy medicines' : 'Sell medicines'}
                          </span>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errors.role && (
                    <p className="mt-2 text-sm text-error-600 dark:text-error-400 font-medium">{errors.role.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <Input
                    label="Phone Number (Optional)"
                    type="tel"
                    placeholder="+880 1234 567890"
                    icon={<Phone className="h-5 w-5" />}
                    error={errors.phone?.message}
                    {...register('phone')}
                  />
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                      Address (Optional)
                    </label>
                    <div className="relative group">
                      <input
                        type="text"
                        className="w-full px-5 py-2.5 pl-10 bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg text-gray-900 dark:text-white transition-all focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent placeholder-gray-500 dark:placeholder-gray-400"
                        placeholder="Full delivery address"
                        {...register('address')}
                      />
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    </div>
                  </div>
                </div>

                {/* Terms */}
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="terms"
                      type="checkbox"
                      className="w-4 h-4 text-primary-600 bg-gray-100 border-gray-300 rounded focus:ring-primary-500 dark:focus:ring-primary-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                      required
                    />
                  </div>
                  <label htmlFor="terms" className="ml-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                    I agree to the{' '}
                    <Link href="/terms" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 hover:underline">Terms of Service</Link>{' '}
                    and{' '}
                    <Link href="/privacy" className="text-primary-600 dark:text-primary-400 hover:text-primary-700 hover:underline">Privacy Policy</Link>
                  </label>
                </div>

                <Button
                  type="submit"
                  loading={isLoading}
                  fullWidth
                  size="xl"
                  className="font-bold tracking-wide shadow-primary-600/20 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-white bg-primary-600 hover:bg-primary-700"
                >
                  Create Account
                </Button>
              </form>
            </div>

            {/* Right Side - Info */}
            <div className="hidden lg:block relative bg-gradient-to-br from-primary-600 to-primary-800 p-12 text-white overflow-hidden">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1576602976047-17f1c6fe9549?w=800&q=80')] opacity-10 mix-blend-overlay bg-cover bg-center"></div>
              
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                   <Link href="/" className="inline-flex items-center justify-center p-3 mb-10 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 hover:bg-white/20 transition-all">
                     <Package className="h-8 w-8 text-white" />
                     <span className="ml-3 text-xl font-bold tracking-tight">MediStore</span>
                   </Link>
                   <h2 className="text-3xl lg:text-4xl font-bold mb-6 leading-tight">Your Health, <br/>Delivered.</h2>
                   <p className="text-primary-100 text-lg mb-12">Join thousands of others taking control of their healthcare with our secure, lightning-fast platform.</p>
                </div>
                
                <div className="space-y-8">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10">
                      <Package className="h-6 w-6 text-primary-200" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Wide Selection</h3>
                      <p className="text-sm text-primary-200">10,000+ authentic medicines from top brands.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10">
                       <svg className="h-6 w-6 text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">Fast Delivery</h3>
                      <p className="text-sm text-primary-200">Same-day delivery in major locations.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center flex-shrink-0 border border-white/10">
                        <svg className="h-6 w-6 text-primary-200" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-lg mb-1">100% Secure</h3>
                      <p className="text-sm text-primary-200">Verified products & protected payments.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Base Desktop Footer Link */}
          <div className="bg-gray-50 dark:bg-gray-900 border-t border-gray-100 dark:border-gray-800 p-6 text-center lg:rounded-bl-3xl">
             <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
               Already have an account?{' '}
               <Link href="/login" className="font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline">
                 Sign in instead
               </Link>
             </p>
          </div>
        </div>
      </div>
    </div>
  );
}