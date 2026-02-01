import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ReactNode } from 'react';

export default function CustomerLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRole="CUSTOMER">
      {children}
    </ProtectedRoute>
  );
}