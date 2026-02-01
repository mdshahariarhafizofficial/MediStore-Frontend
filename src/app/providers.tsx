'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth.store';
import { authApi } from '@/lib/api/auth';

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  const { setUser, setToken } = useAuthStore();

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('medistore_token');
    const userStr = localStorage.getItem('medistore_user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        setUser(user);
        setToken(token);
        
        // Verify token is still valid
        authApi.getCurrentUser().catch(() => {
          localStorage.removeItem('medistore_token');
          localStorage.removeItem('medistore_user');
          setUser(null);
          setToken(null);
        });
      } catch (error) {
        localStorage.removeItem('medistore_token');
        localStorage.removeItem('medistore_user');
      }
    }
  }, [setUser, setToken]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}