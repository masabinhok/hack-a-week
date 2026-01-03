'use client';

import AdminHeader from '@/components/AdminHeader';
import { Card, CardContent } from '@/components/ui/card';

export default function CategoriesPage() {
  return (
    <div>
      <AdminHeader
        title="Categories"
        description="Manage service categories"
      />
      <div className="p-8">
        <Card>
          <CardContent className="py-12 text-center">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Categories Management</h3>
            <p className="text-gray-500">Categories CRUD functionality coming soon.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
