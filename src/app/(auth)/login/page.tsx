'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, AlertCircle, Package, ArrowRight, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '@/components/ui/Button';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/auth.store';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
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
    setValue,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await authApi.login(data);
      if (response.success) {
        login(response.data.user, response.data.token);
        toast.success('Welcome back! Login successful.');
        
        // Redirect based on role
        setTimeout(() => {
          switch (response.data.user.role) {
            case 'ADMIN':
              router.push('/admin');
              break;
            case 'SELLER':
              router.push('/seller/dashboard');
              break;
            case 'CUSTOMER':
              router.push('/');
              break;
            default:
              router.push('/');
          }
        }, 500);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const demoCredentials = [
    { role: 'Admin', email: 'admin@medistore.com', password: 'admin123', icon: ShieldCheck, color: 'text-purple-600 dark:text-purple-400', bg: 'bg-purple-50 dark:bg-purple-900/30 font-semibold' },
    { role: 'Seller', email: 'seller@medistore.com', password: 'seller123', icon: Package, color: 'text-blue-600 dark:text-blue-400', bg: 'bg-blue-50 dark:bg-blue-900/30' },
    { role: 'Customer', email: 'customer@medistore.com', password: 'customer123', icon: Mail, color: 'text-green-600 dark:text-green-400', bg: 'bg-green-50 dark:bg-green-900/30' },
  ];

  const fillDemoCredentials = (email: string, password: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  if (isAuthenticated) return null; // Avoid flicker

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden transition-colors duration-300">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-100 dark:bg-primary-900/20 blur-3xl opacity-50 pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-blue-100 dark:bg-blue-900/20 blur-3xl opacity-50 pointer-events-none"></div>

      <div className="w-full max-w-xl relative z-10">
        {/* Logo & Header */}
        <div className="text-center mb-10">
          <div className="flex justify-center mb-6">
            <Link href="/" className="group flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl shadow-xl hover:shadow-primary-600/30 transition-all hover:scale-105 active:scale-95">
              <Package className="h-10 w-10 text-white" />
            </Link>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-2 tracking-tight">Welcome Back</h1>
          <p className="text-gray-600 dark:text-gray-400 font-medium">Log in to your MediStore account</p>
        </div>

        {/* Login Form */}
        <div className="bg-white dark:bg-gray-800/90 backdrop-blur-xl rounded-3xl shadow-2xl p-8 sm:p-10 border border-gray-100 dark:border-gray-700">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <input
                  type="email"
                  className={`w-full px-5 py-3.5 pl-12 bg-gray-50 dark:bg-gray-900 border rounded-xl text-gray-900 dark:text-white transition-all focus:outline-none focus:ring-4 focus:ring-primary-500/20 ${
                    errors.email ? 'border-error-500 focus:border-error-500' : 'border-gray-200 dark:border-gray-700 focus:border-primary-500'
                  }`}
                  placeholder="name@example.com"
                  {...register('email')}
                />
                <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors ${errors.email ? 'text-error-500' : 'text-gray-400 group-focus-within:text-primary-500'}`} />
                {errors.email && (
                  <AlertCircle className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-error-500" />
                )}
              </div>
              {errors.email && (
                <p className="mt-2 text-sm text-error-600 dark:text-error-400 flex items-center font-medium animate-fade-in">
                  <AlertCircle className="h-4 w-4 mr-1.5" />
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <Link
                  href="/forgot-password"
                  className="text-sm font-medium text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className={`w-full px-5 py-3.5 pl-12 pr-12 bg-gray-50 dark:bg-gray-900 border rounded-xl text-gray-900 dark:text-white transition-all focus:outline-none focus:ring-4 focus:ring-primary-500/20 ${
                    errors.password ? 'border-error-500 focus:border-error-500' : 'border-gray-200 dark:border-gray-700 focus:border-primary-500'
                  }`}
                  placeholder="••••••••"
                  {...register('password')}
                />
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 transition-colors ${errors.password ? 'text-error-500' : 'text-gray-400 group-focus-within:text-primary-500'}`} />
                <button
                  type="button"
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors p-1"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-2 text-sm text-error-600 dark:text-error-400 flex items-center font-medium animate-fade-in">
                  <AlertCircle className="h-4 w-4 mr-1.5" />
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              loading={isLoading}
              fullWidth
              size="xl"
              className="mt-6 font-bold tracking-wide shadow-primary-600/20 shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-white bg-primary-600 hover:bg-primary-700"
            >
              Sign In <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-10 pt-8 border-t border-gray-100 dark:border-gray-700">
            <div className="text-center mb-5">
              <span className="bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-400 px-4 py-1.5 rounded-full text-xs font-bold tracking-wider uppercase">Demo Accounts</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {demoCredentials.map((cred, index) => (
                <button
                  type="button"
                  key={index}
                  className={`flex flex-col items-center justify-center p-3 sm:p-4 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700 transition-all text-center w-full group ${cred.bg}`}
                  onClick={() => fillDemoCredentials(cred.email, cred.password)}
                >
                  <cred.icon className={`h-6 w-6 mb-2 ${cred.color} group-hover:scale-110 transition-transform`} />
                  <span className="text-sm font-bold text-gray-900 dark:text-white mb-0.5">{cred.role}</span>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-semibold">Click to use</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sign Up Link */}
          <div className="mt-8 text-center bg-gray-50 dark:bg-gray-900/50 -mx-8 sm:-mx-10 -mb-8 sm:-mb-10 p-6 rounded-b-3xl border-t border-gray-100 dark:border-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400 font-medium">
              Don't have an account?{' '}
              <Link
                href="/register"
                className="font-bold text-primary-600 dark:text-primary-400 hover:text-primary-700 dark:hover:text-primary-300 hover:underline transition-all"
              >
                Create an account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm">
          <p className="text-gray-500 dark:text-gray-400">
            By signing in, you agree to our{' '}
            <Link href="/terms" className="font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 transition-colors">
              Terms
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 transition-colors">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}