'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import AdminHeader from '@/components/AdminHeader';
import OfficeForm from '@/components/OfficeForm';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api, OfficeDetail } from '@/lib/api';

export default function EditOfficePage() {
  const params = useParams();
  const [office, setOffice] = useState<OfficeDetail | null>(null);
  const [loading, setLoading] = useState(true);

  const officeId = params.id as string;

  useEffect(() => {
    fetchOffice();
  }, [officeId]);

  const fetchOffice = async () => {
    setLoading(true);
    try {
      const response = await api.getOffice(officeId);
      // Handle both direct object and wrapped response
      const data = (response as any)?.data || response;
      setOffice(data);
    } catch (error) {
      console.error('Failed to fetch office:', error);
      setOffice(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div>
        <AdminHeader title="Loading..." description="" />
        <div className="p-8 flex items-center justify-center">
          <svg className="animate-spin h-8 w-8 text-gray-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        </div>
      </div>
    );
  }

  if (!office) {
    return (
      <div>
        <AdminHeader title="Office Not Found" description="" />
        <div className="p-8">
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500 mb-4">The requested office could not be found.</p>
              <Link href="/offices">
                <Button variant="outline">Back to Offices</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader
        title="Edit Office"
        description={office.name}
      />
      <div className="p-8">
        <OfficeForm office={office} />
      </div>
    </div>
  );
}
