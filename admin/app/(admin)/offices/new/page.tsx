'use client';

import AdminHeader from '@/components/AdminHeader';
import OfficeForm from '@/components/OfficeForm';

export default function NewOfficePage() {
  return (
    <div>
      <AdminHeader
        title="Create Office"
        description="Add a new government office"
      />
      <div className="p-8">
        <OfficeForm />
      </div>
    </div>
  );
}
