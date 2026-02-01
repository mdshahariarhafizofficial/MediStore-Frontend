'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function CustomerLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute roles={['CUSTOMER']}>
      {children}
    </ProtectedRoute>
  );
}