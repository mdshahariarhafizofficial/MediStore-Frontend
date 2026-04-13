'use client';

import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingBag, 
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, href: '/seller/dashboard' },
    { name: 'Medicines', icon: Package, href: '/seller/medicines' },
    { name: 'Orders', icon: ShoppingBag, href: '/seller/orders' },
  ];

  return (
    <DashboardLayout 
      menuItems={menuItems}
      roleName="SELLER"
      dashboardTitle="Seller Center"
      basePath="/seller/dashboard"
    >
      {children}
    </DashboardLayout>
  );
}