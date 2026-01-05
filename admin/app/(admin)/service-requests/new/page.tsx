'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import ServiceForm from '@/components/ServiceForm';
import { api, Service, ServiceDetail } from '@/lib/api';
import { useAuth } from '@/lib/auth';
import { cn } from '@/lib/utils';

export default function NewServiceRequestPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isOfficeAdmin } = useAuth();
  const [mode, setMode] = useState<'browse' | 'create'>('browse');
  const [loading, setLoading] = useState(false);
  const [services, setServices] = useState<Service[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedService, setSelectedService] = useState<ServiceDetail | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    if (mode === 'browse') {
      fetchServices();
    }
  }, [mode, searchQuery, page]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await api.getServices({
        page,
        limit: 20,
        search: searchQuery || undefined,
      });
      setServices(response.data || []);
      setTotalPages(response.meta?.totalPages || 1);
    } catch (error) {
      console.error('Failed to fetch services:', error);
      setServices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleServiceSelect = async (service: Service) => {
    setLoading(true);
    try {
      const detail = await api.getService(service.id);
      setSelectedService(detail);
    } catch (error) {
      console.error('Failed to fetch service details:', error);
      setSelectedService(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitRequest = async () => {
    if (!selectedService) return;
    
    setLoading(true);
    try {
      await api.createServiceRequest({
        serviceName: selectedService.name,
        serviceDescription: selectedService.description || undefined,
        categoryId: selectedService.categories?.[0]?.id || undefined,
        priority: 'MEDIUM',
        justification: `Requesting to add ${selectedService.name} service to our office.`,
      });
      router.push('/service-requests');
    } catch (error: any) {
      console.error('Failed to submit request:', error);
      alert(error.message || 'Failed to submit request');
    } finally {
      setLoading(false);
    }
  };

  // Redirect non-office admins
  if (!isOfficeAdmin) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-500">Only office admins can request new services.</p>
            <Button className="mt-4" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader
        title="Request Service"
        description="Browse existing services to claim or create a new service request"
      />

      <div className="p-8">
        {/* Mode Selector */}
        <div className="mb-6 flex gap-4 max-w-4xl">
          <Button
            variant={mode === 'browse' ? 'default' : 'outline'}
            onClick={() => setMode('browse')}
            className="flex-1"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Browse Existing Services
          </Button>
          <Button
            variant={mode === 'create' ? 'default' : 'outline'}
            onClick={() => setMode('create')}
            className="flex-1"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Service
          </Button>
        </div>

        {/* Browse Mode */}
        {mode === 'browse' && (
          <div className="max-w-6xl">
            <Card className="mb-6">
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Search services by name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          setPage(1);
                          fetchServices();
                        }
                      }}
                    />
                  </div>
                  <Button onClick={() => { setPage(1); fetchServices(); }}>
                    Search
                  </Button>
                </div>
              </CardContent>
            </Card>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nepal-blue-600"></div>
              </div>
            ) : services.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Services Found</h3>
                  <p className="text-gray-500">Try a different search or create a new service request.</p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="grid gap-4 mb-6">
                  {services.map((service) => (
                    <Card
                      key={service.id}
                      className={cn(
                        'cursor-pointer transition-all hover:shadow-md',
                        selectedService?.id === service.id && 'ring-2 ring-nepal-blue-500'
                      )}
                      onClick={() => handleServiceSelect(service)}
                    >
                      <CardContent className="p-6">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h3 className="text-lg font-semibold text-gray-900">{service.name}</h3>
                              {service.isOnlineEnabled && (
                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                  Online Available
                                </Badge>
                              )}
                              {service.parentId && (
                                <Badge variant="outline">Sub-service</Badge>
                              )}
                            </div>
                            {service.description && (
                              <p className="text-gray-600 mb-3 line-clamp-2">{service.description}</p>
                            )}
                            <div className="flex gap-4 text-sm text-gray-500">
                              {service.categories && service.categories.length > 0 && (
                                <div>
                                  <span className="font-medium">Categories: </span>
                                  {service.categories.map(c => c.name).join(', ')}
                                </div>
                              )}
                              {service.stepsCount > 0 && (
                                <div>
                                  <span className="font-medium">{service.stepsCount} steps</span>
                                </div>
                              )}
                            </div>
                          </div>
                          {selectedService?.id === service.id && (
                            <div className="ml-4">
                              <svg className="w-6 h-6 text-nepal-blue-600" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      Previous
                    </Button>
                    <span className="px-4 py-2 text-sm text-gray-600">
                      Page {page} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}

                {/* Submit Button */}
                {selectedService && (
                  <Card className="mt-6 bg-nepal-blue-50 border-nepal-blue-200">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-semibold text-gray-900 mb-1">
                            Request: {selectedService.name}
                          </h4>
                          <p className="text-sm text-gray-600">
                            Submit a request to add this service to your office
                          </p>
                        </div>
                        <Button onClick={handleSubmitRequest} disabled={loading}>
                          {loading ? 'Submitting...' : 'Submit Request'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        )}

        {/* Create Mode - Use ServiceForm */}
        {mode === 'create' && (
          <div className="max-w-6xl">
            <Card className="mb-6 bg-yellow-50 border-yellow-200">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-yellow-900 mb-1">New Service Request</h4>
                    <p className="text-sm text-yellow-700">
                      Fill in as much detail as possible. This will be reviewed by administrators before approval.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ServiceForm isServiceRequest={true} />
          </div>
        )}
      </div>
    </div>
  );
}
