'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import ServiceDetailDialog from '@/components/ServiceDetailDialog';
import { api, Service, ServicesResponse, PRIORITY_OPTIONS } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';

export default function ServicesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [services, setServices] = useState<Service[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; service: Service | null }>({
    open: false,
    service: null,
  });
  const [deleting, setDeleting] = useState(false);

  // View detail dialog state
  const [viewDetailDialog, setViewDetailDialog] = useState<{ open: boolean; serviceId: string | null }>({
    open: false,
    serviceId: null,
  });

  const page = parseInt(searchParams.get('page') || '1');
  const parentId = searchParams.get('parentId');

  useEffect(() => {
    fetchServices();
  }, [page, parentId]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const response = await api.getServices({
        page,
        limit: 20,
        search: search || undefined,
        parentId: parentId === 'null' ? null : parentId || undefined,
      });
      setServices(response.data);
      setMeta(response.meta);
    } catch (error) {
      console.error('Failed to fetch services:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchServices();
  };

  const handleDelete = async () => {
    if (!deleteDialog.service) return;
    setDeleting(true);
    try {
      await api.deleteService(deleteDialog.service.id);
      setDeleteDialog({ open: false, service: null });
      fetchServices();
    } catch (error: any) {
      alert(error.message || 'Failed to delete service');
    } finally {
      setDeleting(false);
    }
  };

  const getPriorityBadge = (priority?: string) => {
    const option = PRIORITY_OPTIONS.find((p) => p.value === priority);
    if (!option) return null;
    return (
      <span className={cn('gov-badge', option.color)}>
        {option.label}
      </span>
    );
  };

  return (
    <div>
      <AdminHeader
        title="Services"
        description="Manage government services and their procedures"
        actions={
          <Link href="/services/new">
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Service
            </Button>
          </Link>
        }
      />

      <div className="p-8">
        {/* Search & Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-4">
              <div className="flex-1">
                <Input
                  placeholder="Search services by name, slug, or ID..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button type="submit" variant="secondary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </Button>
              {(search || parentId) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setSearch('');
                    router.push('/services');
                  }}
                >
                  Clear
                </Button>
              )}
            </form>

            {/* Breadcrumb for filtered view */}
            {parentId && (
              <div className="mt-4 flex items-center gap-2 text-sm">
                <Link href="/services" className="text-blue-600 hover:underline">
                  All Services
                </Link>
                <span className="text-gray-400">→</span>
                <span className="text-gray-600">
                  {parentId === 'null' ? 'Root Services' : 'Child Services'}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Services Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Level
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Children
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Steps
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Online
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <svg className="animate-spin h-8 w-8 text-blue-600" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      </div>
                    </td>
                  </tr>
                ) : services.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      No services found
                    </td>
                  </tr>
                ) : (
                  services.map((service, index) => (
                    <tr 
                      key={service.id} 
                      className="hover:bg-gray-50 transition-colors animate-fade-in"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      <td className="px-6 py-4">
                        <div>
                          <Link
                            href={`/services/${service.id}`}
                            className="font-medium text-gray-900 hover:text-blue-600"
                          >
                            {service.name}
                          </Link>
                          <p className="text-sm text-gray-500 mt-0.5">{service.slug}</p>
                          {service.categories.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {service.categories.slice(0, 2).map((cat) => (
                                <Badge key={cat.id} variant="secondary" className="text-xs">
                                  {cat.name}
                                </Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={service.level === 0 ? 'default' : 'outline'}>
                          Level {service.level}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {getPriorityBadge(service.priority)}
                      </td>
                      <td className="px-6 py-4">
                        {service.childrenCount > 0 ? (
                          <Link
                            href={`/services?parentId=${service.id}`}
                            className="text-blue-600 hover:underline"
                          >
                            {service.childrenCount} sub-services
                          </Link>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {service.stepsCount > 0 ? (
                          <Badge variant="success">{service.stepsCount} steps</Badge>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        {service.isOnlineEnabled ? (
                          <span className="inline-flex items-center text-emerald-600">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Yes
                          </span>
                        ) : (
                          <span className="text-gray-400">No</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setViewDetailDialog({ open: true, serviceId: service.id })}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View
                          </Button>
                          <Link href={`/services/${service.id}/edit`}>
                            <Button variant="outline" size="sm">
                              Edit
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteDialog({ open: true, service })}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {meta && meta.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Showing {(meta.page - 1) * meta.limit + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} services
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page === 1}
                  onClick={() => router.push(`/services?page=${meta.page - 1}`)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page === meta.totalPages}
                  onClick={() => router.push(`/services?page=${meta.page + 1}`)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, service: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &ldquo;{deleteDialog.service?.name}&rdquo;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, service: null })}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              isLoading={deleting}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Service Detail Dialog */}
      <ServiceDetailDialog
        serviceId={viewDetailDialog.serviceId}
        open={viewDetailDialog.open}
        onOpenChange={(open) => !open && setViewDetailDialog({ open: false, serviceId: null })}
        showActions={true}
        onEdit={(serviceId) => {
          setViewDetailDialog({ open: false, serviceId: null });
          router.push(`/services/${serviceId}/edit`);
        }}
        onDelete={(serviceId) => {
          const service = services.find(s => s.id === serviceId);
          if (service) {
            setViewDetailDialog({ open: false, serviceId: null });
            setDeleteDialog({ open: true, service });
          }
        }}
      />
    </div>
  );
}
