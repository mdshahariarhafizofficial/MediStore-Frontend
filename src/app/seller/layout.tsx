'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function SellerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute roles={['SELLER']}>
      {children}
    </ProtectedRoute>
  );
}