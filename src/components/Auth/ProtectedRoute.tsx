'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/auth.store';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import { authApi } from '@/lib/api/auth';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'CUSTOMER' | 'SELLER' | 'ADMIN';
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
}) => {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated, user, isLoading, setUser, setToken } = useAuthStore();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      setIsCheckingAuth(true);
      const token = localStorage.getItem('medistore_token');
      const userStr = localStorage.getItem('medistore_user');
      
      if (token && userStr) {
        try {
          const response = await authApi.getCurrentUser();
          if (response.success) {
            setUser(response.data ?? null);
            setToken(token);
          } else {
            localStorage.removeItem('medistore_token');
            localStorage.removeItem('medistore_user');
            router.push('/login');
          }
        } catch (error) {
          localStorage.removeItem('medistore_token');
          localStorage.removeItem('medistore_user');
          router.push('/login');
        }
      } else if (!token && !userStr) {
        router.push('/login');
      }
      setIsCheckingAuth(false);
    };

    checkAuth();
  }, [pathname, setUser, setToken, router]);

  useEffect(() => {
    if (!isCheckingAuth && !isLoading) {
      if (!isAuthenticated) {
        router.push('/login');
      } else if (requiredRole && user?.role !== requiredRole) {
        router.push('/');
      }
    }
  }, [isAuthenticated, user, requiredRole, isLoading, isCheckingAuth, router]);

  if (isCheckingAuth || isLoading || !isAuthenticated || (requiredRole && user?.role !== requiredRole)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" text="Checking authentication..." />
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute;