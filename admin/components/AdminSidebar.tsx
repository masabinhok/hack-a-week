'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

// Full navigation for ADMIN users
const adminNavigation = [
  {
    name: 'Dashboard',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
    badge: null,
  },
  {
    name: 'Services',
    href: '/services',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    badge: 'Core',
  },
  {
    name: 'Categories',
    href: '/categories',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
      </svg>
    ),
    badge: null,
  },
  {
    name: 'Offices',
    href: '/offices',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    badge: null,
  },
];

// Limited navigation for OFFICE_ADMIN users
const officeAdminNavigation = [
  {
    name: 'My Office',
    href: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
    badge: null,
  },
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { user, logout, isAdmin, isOfficeAdmin } = useAuth();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Select navigation based on role
  const navigation = isAdmin ? adminNavigation : officeAdminNavigation;

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  const getRoleBadge = () => {
    if (isAdmin) return { text: 'Administrator', color: 'text-emerald-400' };
    if (isOfficeAdmin) return { text: 'Office Admin', color: 'text-blue-400' };
    return { text: 'User', color: 'text-gray-400' };
  };

  const roleBadge = getRoleBadge();

  return (
    <aside className="flex flex-col h-full w-64 bg-gradient-to-b from-[#0F172A] via-[#1E293B] to-[#0F172A] text-white border-r border-gray-800/50 shadow-2xl">
      {/* Logo/Header - Premium Design */}
      <div className="flex items-center h-20 px-6 border-b border-gray-800/50 bg-gradient-to-r from-nepal-blue-900/20 to-transparent">
        <div className="flex items-center gap-3 group cursor-pointer">
          {/* Premium Logo with Gradient */}
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-br from-nepal-blue-500 to-nepal-crimson-600 rounded-xl blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative w-10 h-10 bg-gradient-to-br from-nepal-blue-600 to-nepal-blue-800 rounded-xl flex items-center justify-center shadow-lg transform group-hover:scale-105 transition-transform">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
              </svg>
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              Setu Admin
            </h1>
            <p className="text-xs text-gray-400 font-medium">Government Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation - Premium Design */}
      <nav className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group relative flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-semibold transition-all duration-200',
                isActive
                  ? 'bg-gradient-to-r from-nepal-blue-900 to-nepal-blue-800 text-white shadow-lg shadow-nepal-blue-900/50'
                  : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
              )}
            >
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-nepal-crimson-500 to-nepal-blue-500 rounded-r-full"></div>
              )}
              
              <div className="flex items-center gap-3">
                <div className={cn(
                  'transition-transform group-hover:scale-110',
                  isActive && 'scale-110'
                )}>
                  {item.icon}
                </div>
                <span>{item.name}</span>
              </div>

              {/* Badge */}
              {item.badge && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-nepal-crimson-600/20 text-nepal-crimson-400 border border-nepal-crimson-500/30 rounded-full">
                  {item.badge}
                </span>
              )}

              {/* Hover Effect */}
              {!isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-nepal-blue-600/0 to-nepal-blue-600/0 group-hover:from-nepal-blue-600/5 group-hover:to-transparent transition-all duration-200"></div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Quick Stats Section - Only for ADMIN */}
      {isAdmin && (
        <div className="px-3 pb-3">
          <div className="bg-gradient-to-br from-nepal-blue-900/40 to-nepal-crimson-900/20 rounded-xl p-4 border border-gray-800/50">
            <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="font-semibold">Quick Actions</span>
            </div>
            <div className="space-y-1.5">
              <Link 
                href="/services?action=new" 
                className="flex items-center gap-2 text-xs text-gray-300 hover:text-white transition-colors"
              >
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                Add New Service
              </Link>
              <Link 
                href="/offices?action=new" 
                className="flex items-center gap-2 text-xs text-gray-300 hover:text-white transition-colors"
              >
                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full"></span>
                Add New Office
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Office Admin Info - Only for OFFICE_ADMIN */}
      {isOfficeAdmin && user?.managedOffice && (
        <div className="px-3 pb-3">
          <div className="bg-gradient-to-br from-blue-900/40 to-blue-800/20 rounded-xl p-4 border border-blue-700/30">
            <div className="flex items-center gap-2 text-xs text-blue-300 mb-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <span className="font-semibold">Your Office</span>
            </div>
            <p className="text-xs text-white font-medium truncate">{user.managedOffice.name}</p>
            <p className="text-[10px] text-gray-400 truncate">{user.managedOffice.address}</p>
          </div>
        </div>
      )}

      {/* User Section - Premium Design */}
      <div className="p-3 border-t border-gray-800/50 bg-gradient-to-r from-gray-900/50 to-transparent">
        {/* User Info */}
        {user && (
          <div className="mb-3 px-3 py-2 bg-gray-800/30 rounded-lg border border-gray-700/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-nepal-blue-500 to-nepal-crimson-500 rounded-full flex items-center justify-center text-xs font-bold">
                {user.username?.[0]?.toUpperCase() || 'A'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">{user.username}</p>
                <p className={cn("text-[10px]", roleBadge.color)}>{roleBadge.text}</p>
              </div>
            </div>
          </div>
        )}

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          disabled={isLoggingOut}
          className="flex items-center justify-center gap-2 w-full px-4 py-3 rounded-xl text-sm font-semibold bg-red-600/10 text-red-400 border border-red-600/20 hover:bg-red-600/20 hover:border-red-500/30 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 group"
        >
          <svg className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          {isLoggingOut ? 'Logging out...' : 'Logout'}
        </button>
      </div>
    </aside>
  );
}
