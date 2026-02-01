import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ReactNode } from 'react';

export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRole="SELLER">
      {children}
    </ProtectedRoute>
  );
}