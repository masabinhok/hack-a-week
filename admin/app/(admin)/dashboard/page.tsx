'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api, ServiceStats, Office } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

// Admin Dashboard Component
function AdminDashboard() {
  const [stats, setStats] = useState<ServiceStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.getServiceStats();
        const statsData = (response as any).data || response;
        setStats(statsData);
      } catch (error) {
        console.error('Failed to fetch stats:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const statCards = [
    {
      title: 'Total Services',
      value: stats?.totalServices ?? '-',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
      gradient: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600',
      href: '/services',
      change: '+12%',
    },
    {
      title: 'Root Services',
      value: stats?.rootServices ?? '-',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      ),
      gradient: 'from-emerald-500 to-emerald-600',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-600',
      href: '/services?parentId=null',
      change: '+8%',
    },
    {
      title: 'Leaf Services',
      value: stats?.leafServices ?? '-',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      gradient: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600',
      href: '/services',
      change: '+15%',
    },
    {
      title: 'Total Steps',
      value: stats?.totalSteps ?? '-',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
        </svg>
      ),
      gradient: 'from-amber-500 to-amber-600',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-600',
      href: '/services',
      change: '+23%',
    },
  ];

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="Dashboard"
        description="Real-time overview of your government services platform"
        actions={
          <div className="flex items-center gap-3">
            <Link href="/services/new">
              <button className="px-4 py-2 text-sm font-semibold text-white bg-gradient-to-r from-nepal-blue-900 to-nepal-blue-800 rounded-lg hover:shadow-lg transition-all">
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  New Service
                </div>
              </button>
            </Link>
          </div>
        }
      />

      <div className="p-8 space-y-8">
        {/* Premium Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statCards.map((stat, index) => (
            <Link key={stat.title} href={stat.href}>
              <div 
                className="group bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 cursor-pointer animate-fade-in-up overflow-hidden"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${stat.bgColor} group-hover:scale-110 transition-transform`}>
                      <div className={stat.textColor}>
                        {stat.icon}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                      </svg>
                      {stat.change}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-600 mb-1">{stat.title}</p>
                    <p className="text-3xl font-bold text-gray-900">
                      {loading ? (
                        <span className="inline-block w-16 h-8 bg-gray-200 rounded animate-pulse"></span>
                      ) : (
                        stat.value
                      )}
                    </p>
                  </div>
                  <div className={`mt-4 h-1 w-full bg-gradient-to-r ${stat.gradient} rounded-full opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Activity Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recent Activity */}
          <div className="lg:col-span-2">
            <Card className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 h-full">
              <CardHeader className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-nepal-blue-600 to-nepal-blue-800 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <CardTitle className="text-xl">Quick Actions</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    href="/services/new"
                    className="group flex items-center gap-4 p-5 rounded-xl border-2 border-gray-200 hover:border-nepal-blue-600 hover:bg-nepal-blue-50 transition-all"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-nepal-blue-900">Create Service</h3>
                      <p className="text-sm text-gray-600">Add new government service</p>
                    </div>
                  </Link>

                  <Link
                    href="/services"
                    className="group flex items-center gap-4 p-5 rounded-xl border-2 border-gray-200 hover:border-emerald-600 hover:bg-emerald-50 transition-all"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-emerald-900">View Services</h3>
                      <p className="text-sm text-gray-600">Manage existing services</p>
                    </div>
                  </Link>

                  <Link
                    href="/categories"
                    className="group flex items-center gap-4 p-5 rounded-xl border-2 border-gray-200 hover:border-purple-600 hover:bg-purple-50 transition-all"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-purple-900">Categories</h3>
                      <p className="text-sm text-gray-600">Organize service categories</p>
                    </div>
                  </Link>

                  <Link
                    href="/offices"
                    className="group flex items-center gap-4 p-5 rounded-xl border-2 border-gray-200 hover:border-amber-600 hover:bg-amber-50 transition-all"
                  >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center group-hover:scale-110 transition-transform shadow-lg">
                      <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900 group-hover:text-amber-900">Offices</h3>
                      <p className="text-sm text-gray-600">Manage office locations</p>
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* System Status */}
          <div className="space-y-6">
            <Card className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden">
              <div className="bg-gradient-to-br from-nepal-blue-900 to-nepal-blue-800 p-6 text-white">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg">System Status</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-100">API Status</span>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span className="text-sm font-semibold">Operational</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-100">Database</span>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span className="text-sm font-semibold">Connected</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-blue-100">Cache</span>
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
                      <span className="text-sm font-semibold">Active</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-nepal-crimson-600 to-nepal-crimson-700 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h3 className="font-bold text-lg">Recent Updates</h3>
                </div>
                <div className="space-y-3">
                  <div className="text-sm text-gray-600">
                    <p className="font-semibold text-gray-900 mb-1">Version 2.0.1</p>
                    <p>Enhanced dashboard with premium UI components</p>
                    <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Premium Branding Footer */}
        <Card className="bg-white rounded-xl shadow-xl border-0 overflow-hidden">
          <div className="bg-gradient-to-r from-nepal-blue-900 via-nepal-blue-800 to-nepal-crimson-900 p-8 text-white">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-3">Setu Admin Portal</h2>
                <p className="text-blue-100 max-w-2xl leading-relaxed">
                  Empowering efficient governance through streamlined service management. 
                  Manage government services, offices, and categories with enterprise-grade tools.
                </p>
                <div className="flex items-center gap-4 mt-6">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-blue-100">All Systems Operational</span>
                  </div>
                  <span className="text-blue-300">|</span>
                  <div className="text-sm text-blue-100">
                    Last sync: {new Date().toLocaleTimeString()}
                  </div>
                </div>
              </div>
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 bg-white/10 rounded-full blur-3xl"></div>
                  <svg className="relative w-32 h-32 text-white/20" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// Office Admin Dashboard Component
function OfficeAdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [office, setOffice] = useState<Office | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOffice = async () => {
      try {
        const response = await api.getOffices();
        const offices = response?.data || [];
        if (offices.length > 0) {
          setOffice(offices[0]);
        }
      } catch (error) {
        console.error('Failed to fetch office:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchOffice();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-nepal-blue-600 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-gray-600">Loading your office...</p>
        </div>
      </div>
    );
  }

  if (!office) {
    return (
      <div className="min-h-screen">
        <AdminHeader
          title="No Office Assigned"
          description="You don't have an office assigned to your account"
        />
        <div className="p-8">
          <Card>
            <CardContent className="py-12 text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Office Found</h3>
              <p className="text-gray-500">Please contact the system administrator to assign an office to your account.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <AdminHeader
        title="My Office Dashboard"
        description={`Welcome back, ${user?.username || 'Office Admin'}`}
      />

      <div className="p-8 space-y-8">
        {/* Office Info Card */}
        <Card className="bg-gradient-to-br from-nepal-blue-900 to-nepal-blue-800 text-white overflow-hidden border-0">
          <CardContent className="p-8">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">{office.name}</h2>
                    {office.nameNepali && (
                      <p className="text-blue-200">{office.nameNepali}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-blue-200 text-sm mb-1">Category</p>
                    <p className="font-semibold">{office.category?.name || '-'}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-blue-200 text-sm mb-1">Status</p>
                    <Badge className={cn(
                      'mt-1',
                      office.isActive 
                        ? 'bg-green-500/20 text-green-200 border-green-400/30' 
                        : 'bg-red-500/20 text-red-200 border-red-400/30'
                    )}>
                      {office.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-blue-200 text-sm mb-1">Address</p>
                    <p className="font-semibold">{office.address}</p>
                  </div>
                  <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                    <p className="text-blue-200 text-sm mb-1">Contact</p>
                    <p className="font-semibold">{office.contact || 'Not set'}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions for Office Admin */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                Edit Office Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                Update your office information including contact details, address, facilities, and more.
              </p>
              <Button onClick={() => router.push(`/offices/${office.id}/edit`)}>
                Edit Office
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-lg transition-all">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                View Office Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600 mb-4">
                View complete information about your office including location, ratings, and facilities.
              </p>
              <Button variant="outline" onClick={() => router.push(`/offices/${office.id}`)}>
                View Details
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Office Details Summary */}
        <Card className="bg-white rounded-xl border border-gray-200 shadow-sm">
          <CardHeader className="border-b border-gray-100">
            <CardTitle>Office Information</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <dl className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <dt className="text-sm font-medium text-gray-500">Office ID</dt>
                <dd className="mt-1 text-sm text-gray-900 font-mono">{office.officeId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {office.email ? (
                    <a href={`mailto:${office.email}`} className="text-blue-600 hover:underline">
                      {office.email}
                    </a>
                  ) : (
                    <span className="text-gray-400">Not set</span>
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Website</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {office.website ? (
                    <a href={office.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {office.website}
                    </a>
                  ) : (
                    <span className="text-gray-400">Not set</span>
                  )}
                </dd>
              </div>
              {office.location && (
                <div className="md:col-span-2 lg:col-span-3">
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {[
                      office.location.wardNumber && `Ward ${office.location.wardNumber}`,
                      office.location.municipalityName,
                      office.location.districtName,
                      office.location.provinceName,
                    ]
                      .filter(Boolean)
                      .join(', ') || 'Not specified'}
                  </dd>
                </div>
              )}
              {office.facilities && office.facilities.length > 0 && (
                <div className="md:col-span-2 lg:col-span-3">
                  <dt className="text-sm font-medium text-gray-500 mb-2">Facilities</dt>
                  <dd className="flex flex-wrap gap-2">
                    {office.facilities.map((facility, index) => (
                      <Badge key={index} variant="secondary">
                        {facility}
                      </Badge>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Main Dashboard Page
export default function DashboardPage() {
  const { isAdmin, isOfficeAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <svg className="animate-spin h-12 w-12 text-nepal-blue-600" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (isOfficeAdmin) {
    return <OfficeAdminDashboard />;
  }

  return <AdminDashboard />;
}
