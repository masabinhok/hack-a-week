'use client';

import { useAuth } from '@/lib/auth';
import AdminSidebar from '@/components/AdminSidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-nepal-blue-900 via-nepal-blue-800 to-nepal-crimson-900">
        <div className="text-center">
          <div className="relative">
            <div className="absolute inset-0 bg-white/20 rounded-full blur-xl"></div>
            <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto"></div>
          </div>
          <p className="mt-6 text-white text-lg font-semibold">Loading Admin Panel...</p>
          <p className="mt-2 text-white/70 text-sm">Preparing your dashboard</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // Will redirect in AuthProvider
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-100">
      <AdminSidebar />
      <main className="flex-1 overflow-y-auto relative">
        {/* Subtle Background Pattern */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(0, 56, 147) 1px, transparent 0)',
            backgroundSize: '40px 40px'
          }}></div>
        </div>
        <div className="relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
