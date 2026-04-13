'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ShoppingCart, User, Package, Home, LogOut, Menu, X, Bell, ChevronDown, Info, Phone } from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import { useCartStore } from '@/store/cart.store';
import Button from '@/components/ui/Button';
import { authApi } from '@/lib/api/auth';
import ThemeToggle from './ThemeToggle';

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { itemCount } = useCartStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('medistore_token');
    if (token && !isAuthenticated) {
      authApi.getCurrentUser().catch(() => {
        localStorage.removeItem('medistore_token');
        localStorage.removeItem('medistore_user');
      });
    }
  }, [isAuthenticated]);

  const handleLogout = () => {
    logout();
    authApi.logout();
    router.push('/login');
  };

  const publicLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Shop', href: '/shop', icon: Package },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Contact', href: '/contact', icon: Phone },
  ];

  const customerLinks = [
    { name: 'Cart', href: '/cart', icon: ShoppingCart, badge: itemCount },
    { name: 'Orders', href: '/orders', icon: Package },
    { name: 'Profile', href: '/profile', icon: User },
  ];

  const sellerLinks = [
    { name: 'Dashboard', href: '/seller/dashboard', icon: Home },
    { name: 'Medicines', href: '/seller/medicines', icon: Package },
    { name: 'Orders', href: '/seller/orders', icon: Package },
  ];

  const adminLinks = [
    { name: 'Dashboard', href: '/admin', icon: Home },
    { name: 'Users', href: '/admin/users', icon: User },
    { name: 'Orders', href: '/admin/orders', icon: Package },
    { name: 'Categories', href: '/admin/categories', icon: Package },
  ];

  const getRoleLinks = () => {
    if (!user) return publicLinks;
    switch (user.role) {
      case 'CUSTOMER':
        return [...publicLinks, ...customerLinks];
      case 'SELLER':
        return [...publicLinks, ...sellerLinks];
      case 'ADMIN':
        return [...publicLinks, ...adminLinks];
      default:
        return publicLinks;
    }
  };

  const links = getRoleLinks();

  // User avatar with photo URL
  const renderUserAvatar = () => {
    if (user?.photoUrl) {
      return (
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center overflow-hidden border border-gray-300 bg-gray-100"
          style={{
            backgroundImage: `url('${user.photoUrl}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      );
    } else {
      return (
        <div className="w-8 h-8 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      );
    }
  };

  // Mobile user avatar
  const renderMobileUserAvatar = () => {
    if (user?.photoUrl) {
      return (
        <div 
          className="w-10 h-10 rounded-full flex items-center justify-center overflow-hidden border-2 border-white shadow-md"
          style={{
            backgroundImage: `url('${user.photoUrl}')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />
      );
    } else {
      return (
        <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
          {user?.name?.charAt(0).toUpperCase()}
        </div>
      );
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md shadow-sm border-b border-gray-200/50 dark:border-gray-800/50 py-2' 
        : 'bg-white/40 dark:bg-[#0a0a0a]/40 backdrop-blur-sm border-b border-transparent py-4'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center transition-all duration-300">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-md group-hover:shadow-primary-500/30 group-hover:scale-105 transition-all duration-300">
                <Package className="h-6 w-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 dark:from-primary-400 dark:to-primary-600 bg-clip-text text-transparent">
                  MediStore
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {links.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    relative flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 overflow-hidden group
                    ${isActive
                      ? 'text-primary-700 dark:text-primary-400 bg-primary-50/80 dark:bg-primary-900/20'
                      : 'text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-50/50 dark:hover:bg-gray-800/50'
                    }
                  `}
                >
                  <item.icon className="h-4 w-4 relative z-10 transition-transform group-hover:scale-110" />
                  <span className="relative z-10">{item.name}</span>
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary-500 dark:bg-primary-400 rounded-t-full shadow-[0_-2px_10px_rgba(59,130,246,0.5)]"></span>
                  )}
                  {item.badge && item.badge > 0 && (
                    <span className="absolute -top-1 -right-1 bg-error-500 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center shadow-sm z-20 animate-pulse">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <>
                <div className="hidden md:block relative">
                  <div className="flex items-center space-x-2">
                    <ThemeToggle />
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      {renderUserAvatar()}
                      <div className="text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role?.toLowerCase()}</p>
                      </div>
                      <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                    </button>
                  </div>
                  
                  {userMenuOpen && (
                    <>
                      <div 
                        className="fixed inset-0 z-40" 
                        onClick={() => setUserMenuOpen(false)}
                      />
                      <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800 py-1 z-50 animate-fade-in">
                        <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800 flex items-center space-x-3">
                          {renderUserAvatar()}
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{user?.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">{user?.email}</p>
                          </div>
                        </div>
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-6 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center space-x-2"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <ThemeToggle />
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-gray-200/50 dark:border-gray-800/50 animate-slide-up bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl shadow-2xl p-4 absolute left-4 right-4">
            <div className="flex flex-col space-y-1 pt-2">
              {links.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`
                      flex items-center justify-between px-4 py-3.5 rounded-xl text-base font-bold transition-all
                      ${isActive
                        ? 'bg-primary-50/80 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-4">
                      <item.icon className={`h-5 w-5 ${isActive ? 'scale-110' : ''} transition-transform`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && item.badge > 0 && (
                      <span className="bg-error-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center shadow-md">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}

              {isAuthenticated ? (
                <div className="pt-4 border-t border-gray-200">
                  <div className="px-4 py-3 flex items-center space-x-3">
                    {renderMobileUserAvatar()}
                    <div>
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-sm text-gray-500">{user?.email}</p>
                    </div>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-gray-50 rounded-lg"
                  >
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                  <button
                    onClick={() => {
                      handleLogout();
                      setIsMenuOpen(false);
                    }}
                    className="flex items-center space-x-3 px-4 py-3 text-error-600 hover:bg-error-50 rounded-lg w-full"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Sign out</span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-3 text-center border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMenuOpen(false)}
                    className="px-4 py-3 text-center bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;