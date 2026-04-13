'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingBag, 
  Package, 
  Settings, 
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/admin' },
    { name: 'Users', icon: Users, href: '/admin/users' },
    { name: 'Orders', icon: ShoppingBag, href: '/admin/orders' },
    { name: 'Categories', icon: Package, href: '/admin/categories' },
    { name: 'Settings', icon: Settings, href: '/profile' },
  ];

  return (
    <DashboardLayout 
      menuItems={menuItems}
      roleName="ADMIN"
      dashboardTitle="Admin Pro"
      basePath="/admin"
    >
      {children}
    </DashboardLayout>
  );
}