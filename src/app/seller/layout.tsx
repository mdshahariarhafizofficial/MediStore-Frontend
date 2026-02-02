import ProtectedRoute from '@/components/Auth/ProtectedRoute';
import { ReactNode } from 'react';

export default function SellerLayout({ children }: { children: ReactNode }) {
  return (
    <ProtectedRoute requiredRole="SELLER">
      {children}
    </ProtectedRoute>
  );
}