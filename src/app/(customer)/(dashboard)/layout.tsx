'use client';

import React from 'react';
import { 
  User, 
  ShoppingBag, 
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function CustomerDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuItems = [
    { name: 'My Profile', icon: User, href: '/profile' },
    { name: 'My Orders', icon: ShoppingBag, href: '/orders' },
  ];

  return (
    <DashboardLayout 
      menuItems={menuItems}
      roleName="CUSTOMER"
      dashboardTitle="My Account"
      basePath="/profile"
    >
      {children}
    </DashboardLayout>
  );
}
