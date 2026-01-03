'use client';

import { useSearchParams } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';
import ServiceForm from '@/components/ServiceForm';

export default function NewServicePage() {
  const searchParams = useSearchParams();
  const parentId = searchParams.get('parentId') || undefined;

  return (
    <div>
      <AdminHeader
        title="Create New Service"
        description={parentId ? "Add a new child service" : "Add a new government service to the portal"}
      />
      <div className="p-8">
        <ServiceForm parentId={parentId} />
      </div>
    </div>
  );
}
