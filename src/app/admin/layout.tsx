'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ProtectedRoute roles={['ADMIN']}>
      {children}
    </ProtectedRoute>
  );
}