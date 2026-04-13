import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Menu, 
  Bell,
  Search,
  LogOut,
  X,
  ChevronRight,
  ShieldCheck,
  Building2,
  User as UserIcon,
  LucideIcon
} from 'lucide-react';
import { useAuthStore } from '@/store/auth.store';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export interface MenuItem {
  name: string;
  icon: LucideIcon;
  href: string;
}

export interface DashboardLayoutProps {
  children: React.ReactNode;
  menuItems: MenuItem[];
  roleName: 'ADMIN' | 'SELLER' | 'CUSTOMER';
  dashboardTitle: string;
  basePath: string;
}

export default function DashboardLayout({
  children,
  menuItems,
  roleName,
  dashboardTitle,
  basePath,
}: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  
  // Mounted state to fix hydration issues
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
      if (window.innerWidth < 1024) setSidebarOpen(false);
      else setSidebarOpen(true);
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (mounted && (!isAuthenticated || user?.role !== roleName)) {
      router.push('/login');
    }
  }, [mounted, isAuthenticated, user, roleName, router]);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  if (!mounted || !isAuthenticated || user?.role !== roleName) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="lg" text="Authenticating Session..." />
      </div>
    );
  }

  const getRoleIcon = () => {
    switch (roleName) {
      case 'ADMIN': return <ShieldCheck className="h-5 w-5 text-white" />;
      case 'SELLER': return <Building2 className="h-5 w-5 text-white" />;
      case 'CUSTOMER': return <UserIcon className="h-5 w-5 text-white" />;
      default: return <ShieldCheck className="h-5 w-5 text-white" />;
    }
  };

  const getRoleLabel = () => {
    switch (roleName) {
      case 'ADMIN': return 'Administrator';
      case 'SELLER': return 'Store Owner';
      case 'CUSTOMER': return 'Customer';
      default: return 'User';
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 dark:bg-[#0a0a0a] transition-colors duration-300">
      
      {/* Overlay for mobile */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-200 dark:border-gray-800">
          <Link href={basePath} className="flex items-center space-x-2">
            <div className="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30">
               {getRoleIcon()}
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent truncate">
              {dashboardTitle}
            </span>
          </Link>
          {isMobile && (
            <button onClick={() => setSidebarOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none">
              <X className="h-5 w-5" />
            </button>
          )}
        </div>

        {/* Sidebar Nav */}
        <nav className="flex-1 overflow-y-auto py-6 px-4 space-y-1.5 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-gray-800">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest px-3 mb-4">Menu</div>
          
          {menuItems.map((item) => {
            // Check if exact match or subpath
            const isActive = pathname === item.href || (item.href !== basePath && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-400' 
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? 'text-primary-600 dark:text-primary-400' : 'text-gray-400 dark:text-gray-500'}`} />
                <span className="flex-1">{item.name}</span>
                {isActive && <div className="h-1.5 w-1.5 rounded-full bg-primary-500"></div>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleLogout}
            className="flex w-full items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-semibold text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors group"
          >
            <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Navbar */}
        <header className="h-16 flex items-center justify-between px-4 sm:px-6 lg:px-8 bg-white/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 z-30">
          <div className="flex items-center flex-1">
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-primary-500 lg:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>
            
            {/* Search */}
            <div className="hidden sm:flex items-center max-w-md w-full ml-4 relative">
              <Search className="absolute left-3 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search across panel..." 
                className="w-full pl-10 pr-4 py-2 bg-gray-100 dark:bg-gray-800 border-transparent focus:bg-white focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 dark:focus:bg-gray-900 rounded-xl text-sm transition-all"
              />
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/" className="hidden sm:flex items-center text-sm font-semibold text-gray-500 hover:text-primary-600 dark:hover:text-primary-400 transition-colors mr-2">
              View Site <ChevronRight className="h-4 w-4 ml-1" />
            </Link>

            <button className="relative p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800 rounded-lg transition-colors">
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-error-500 border-2 border-white dark:border-gray-900"></span>
            </button>

            {/* Profile Dropdown Trigger (Basic view for layout) */}
            <div className="flex items-center space-x-3 pl-4 border-l border-gray-200 dark:border-gray-800">
               <div className="h-9 w-9 rounded-full overflow-hidden border border-primary-100 dark:border-primary-700 flex items-center justify-center bg-gray-100 dark:bg-gray-800"
                 style={{
                   backgroundImage: user?.photoUrl ? `url('${user.photoUrl}')` : 'none',
                   backgroundSize: 'cover',
                   backgroundPosition: 'center',
                 }}
               >
                 {!user?.photoUrl && (
                   <span className="font-bold text-gray-500 dark:text-gray-400">
                     {user?.name?.charAt(0).toUpperCase()}
                   </span>
                 )}
               </div>
               <div className="hidden md:block text-left">
                  <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight truncate max-w-[120px]">{user?.name}</p>
                  <p className="text-[10px] uppercase font-bold text-primary-600 tracking-wider">{getRoleLabel()}</p>
               </div>
            </div>
          </div>
        </header>

        {/* Dashboard Content Container */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-[#0a0a0a]">
          {children}
        </main>
      </div>
    </div>
  );
}
