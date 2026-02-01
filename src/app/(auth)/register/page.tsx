'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Package, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { authApi } from '@/lib/api/auth';
import { useAuthStore } from '@/store/auth.store';

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string(),
  role: z.enum(['CUSTOMER', 'SELLER']),
  phone: z.string().optional(),
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
  const { login } = useAuthStore();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

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
        login(response.data!.user, response.data!.token);
        toast.success('Registration successful!');
        
        // Redirect based on role
        switch (response.data!.user.role) {
          case 'SELLER':
            router.push('/seller/dashboard');
            break;
          case 'CUSTOMER':
            router.push('/');
            break;
          default:
            router.push('/');
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <Package className="h-12 w-12 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Create Account</h1>
        <p className="text-gray-600 mt-2">Join MediStore today</p>
      </div>

      <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name"
            type="text"
            autoComplete="name"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Email Address"
            type="email"
            autoComplete="email"
            error={errors.email?.message}
            {...register('email')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                error={errors.password?.message}
                {...register('password')}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                autoComplete="new-password"
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Account Type
            </label>
            <div className="grid grid-cols-2 gap-4">
              {(['CUSTOMER', 'SELLER'] as const).map((role) => (
                <label
                  key={role}
                  className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50"
                >
                  <input
                    type="radio"
                    value={role}
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500"
                    {...register('role')}
                  />
                  <span className="ml-3 text-sm font-medium text-gray-900">
                    {role === 'CUSTOMER' ? 'Customer' : 'Seller'}
                  </span>
                </label>
              ))}
            </div>
            {errors.role && (
              <p className="mt-1 text-sm text-red-600">{errors.role.message}</p>
            )}
          </div>

          <Input
            label="Phone Number (Optional)"
            type="tel"
            autoComplete="tel"
            error={errors.phone?.message}
            {...register('phone')}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address (Optional)
            </label>
            <textarea
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              rows={3}
              {...register('address')}
            />
          </div>

          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              required
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
              I agree to the{' '}
              <Link href="/terms" className="text-primary-600 hover:text-primary-500">
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-primary-600 hover:text-primary-500">
                Privacy Policy
              </Link>
            </label>
          </div>

          <Button
            type="submit"
            loading={isLoading}
            fullWidth
            className="mt-4"
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-primary-600 hover:text-primary-500"
            >
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}