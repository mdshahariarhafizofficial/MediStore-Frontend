'use client';

import ProtectedRoute from '@/components/Auth/ProtectedRoute';

export default function SellerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute requiredRole="SELLER">
      {children}
    </ProtectedRoute>
  );
}