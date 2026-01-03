'use client';

import AdminHeader from '@/components/AdminHeader';
import { Card, CardContent } from '@/components/ui/card';

export default function OfficesPage() {
  return (
    <div>
      <AdminHeader
        title="Offices"
        description="Manage government offices"
      />
      <div className="p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Offices Management</h3>
            <p className="text-gray-500">Offices CRUD functionality coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
