'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import ServiceDetailDialog from '@/components/ServiceDetailDialog';
import {
  api,
  AvailableService,
  OfficeService,
  PRIORITY_OPTIONS,
} from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

export default function OfficeServicesPage() {
  const router = useRouter();
  const { user, isOfficeAdmin, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('claimed');
  
  // Available services state
  const [availableServices, setAvailableServices] = useState<AvailableService[]>([]);
  const [availableMeta, setAvailableMeta] = useState(() => ({ total: 0, page: 1, limit: 20, totalPages: 0 }));
  const [searchQuery, setSearchQuery] = useState('');
  
  // Claimed services state
  const [claimedServices, setClaimedServices] = useState<OfficeService[]>([]);
  const [claimedMeta, setClaimedMeta] = useState(() => ({ total: 0, page: 1, limit: 20, totalPages: 0 }));
  
  const [loading, setLoading] = useState(true);
  const [officeId, setOfficeId] = useState<string | null>(null);

  // Dialog states
  const [claimDialog, setClaimDialog] = useState<{ open: boolean; service: AvailableService | null }>({
    open: false,
    service: null,
  });
  const [revokeDialog, setRevokeDialog] = useState<{ open: boolean; officeService: OfficeService | null }>({
    open: false,
    officeService: null,
  });
  const [claimNotes, setClaimNotes] = useState('');
  const [processing, setProcessing] = useState(false);

  // View detail dialog state
  const [viewDetailDialog, setViewDetailDialog] = useState<{ open: boolean; serviceId: string | null }>({
    open: false,
    serviceId: null,
  });

  useEffect(() => {
    // Get office ID from user's managed office
    if (user?.managedOffice?.id) {
      setOfficeId(user.managedOffice.id);
    }
  }, [user]);

  const fetchAvailableServices = useCallback(async () => {
    if (!officeId) return;
    setLoading(true);
    try {
      const response = await api.getAvailableServicesForOffice(officeId, {
        page: availableMeta?.page ?? 1,
        limit: 20,
        search: searchQuery || undefined,
      });
      setAvailableServices(response.data);
      setAvailableMeta(response.meta ?? { total: 0, page: 1, limit: 20, totalPages: 0 });
    } catch (error) {
      console.error('Failed to fetch available services:', error);
    } finally {
      setLoading(false);
    }
  }, [officeId, availableMeta?.page, searchQuery]);

  const fetchClaimedServices = useCallback(async () => {
    if (!officeId) return;
    setLoading(true);
    try {
      const response = await api.getOfficeServices(officeId, {
        page: claimedMeta?.page ?? 1,
        limit: 20,
        status: 'CLAIMED',
      });
      setClaimedServices(response.data);
      setClaimedMeta(response.meta ?? { total: 0, page: 1, limit: 20, totalPages: 0 });
    } catch (error) {
      console.error('Failed to fetch claimed services:', error);
    } finally {
      setLoading(false);
    }
  }, [officeId, claimedMeta?.page]);

  useEffect(() => {
    if (officeId) {
      if (activeTab === 'claimed') {
        fetchClaimedServices();
      } else {
        fetchAvailableServices();
      }
    }
  }, [officeId, activeTab, fetchAvailableServices, fetchClaimedServices]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setAvailableMeta(prev => ({ ...prev, page: 1 }));
    fetchAvailableServices();
  };

  const handleClaimService = async () => {
    if (!claimDialog.service || !officeId) return;
    setProcessing(true);
    try {
      await api.claimServiceForOffice(officeId, {
        serviceId: claimDialog.service.id,
        notes: claimNotes || undefined,
      });
      setClaimDialog({ open: false, service: null });
      setClaimNotes('');
      fetchAvailableServices();
      fetchClaimedServices();
    } catch (error: any) {
      alert(error.message || 'Failed to claim service');
    } finally {
      setProcessing(false);
    }
  };

  const handleRevokeService = async () => {
    if (!revokeDialog.officeService || !officeId) return;
    setProcessing(true);
    try {
      await api.revokeOfficeService(officeId, revokeDialog.officeService.id);
      setRevokeDialog({ open: false, officeService: null });
      fetchClaimedServices();
    } catch (error: any) {
      alert(error.message || 'Failed to revoke service');
    } finally {
      setProcessing(false);
    }
  };

  const getPriorityBadge = (priority?: string) => {
    const option = PRIORITY_OPTIONS.find((p) => p.value === priority);
    if (!option) return null;
    return <span className={cn('px-2 py-0.5 text-xs rounded-full', option.color)}>{option.label}</span>;
  };

  // Redirect if not office admin
  if (!isOfficeAdmin && !isAdmin) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
            <p className="text-gray-500">You do not have permission to access this page.</p>
            <Button className="mt-4" onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!officeId) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nepal-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading office information...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <AdminHeader
        title="Office Services"
        description={`Manage services offered by ${user?.managedOffice?.name || 'your office'}`}
        actions={
          <Button variant="outline" onClick={() => router.push('/service-requests/new')}>
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Request New Service
          </Button>
        }
      />

      <div className="p-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="claimed">
              My Services ({claimedMeta.total})
            </TabsTrigger>
            <TabsTrigger value="available">
              Available to Claim
            </TabsTrigger>
          </TabsList>

          <TabsContent value="claimed">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nepal-blue-600"></div>
              </div>
            ) : claimedServices.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Services Claimed</h3>
                  <p className="text-gray-500 mb-4">
                    Your office has not claimed any services yet. Browse available services to get started.
                  </p>
                  <Button onClick={() => setActiveTab('available')}>
                    Browse Available Services
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-4">
                {claimedServices.map((os) => (
                  <Card key={os.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">{os.service.name}</h3>
                            <Badge className="bg-green-100 text-green-800 border-green-300">Claimed</Badge>
                            {getPriorityBadge(os.service.priority)}
                          </div>
                          
                          {os.customDescription || os.service.description ? (
                            <p className="text-gray-600 mb-3">
                              {os.customDescription || os.service.description}
                            </p>
                          ) : null}

                          <div className="flex gap-4 text-sm text-gray-500">
                            <span>Service ID: {os.service.serviceId}</span>
                            <span>Claimed: {formatDate(os.claimedAt)}</span>
                          </div>

                          {os.notes && (
                            <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                              <span className="text-sm text-gray-500">Notes:</span>
                              <p className="text-sm text-gray-700 mt-1">{os.notes}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex gap-2 ml-4">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setViewDetailDialog({ open: true, serviceId: os.service.id })}
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                            View Details
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 border-red-300 hover:bg-red-50"
                            onClick={() => setRevokeDialog({ open: true, officeService: os })}
                          >
                            Revoke
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="available">
            {/* Search */}
            <form onSubmit={handleSearch} className="mb-6">
              <div className="flex gap-2">
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="max-w-md"
                />
                <Button type="submit">Search</Button>
              </div>
            </form>

            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nepal-blue-600"></div>
              </div>
            ) : availableServices.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Services Found</h3>
                  <p className="text-gray-500">
                    {searchQuery ? 'Try a different search term.' : 'No services are available to claim.'}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableServices.map((service) => (
                  <Card
                    key={service.id}
                    className={cn(
                      'transition-all',
                      service.isClaimedByOffice
                        ? 'opacity-60 bg-gray-50'
                        : 'hover:shadow-md cursor-pointer'
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h4 className="font-semibold text-gray-900 line-clamp-1">{service.name}</h4>
                        {service.isClaimedByOffice && (
                          <Badge variant="secondary" className="text-xs">Claimed</Badge>
                        )}
                      </div>
                      
                      {service.description && (
                        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{service.description}</p>
                      )}

                      <div className="flex items-center gap-2 mb-3">
                        {getPriorityBadge(service.priority)}
                        {service.isOnlineEnabled && (
                          <Badge variant="outline" className="text-xs">Online</Badge>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="w-full"
                          onClick={() => setViewDetailDialog({ open: true, serviceId: service.id })}
                        >
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View Details
                        </Button>
                        {service.isClaimedByOffice ? (
                          <Button size="sm" variant="outline" disabled className="w-full">
                            Already Claimed
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            className="w-full"
                            onClick={() => setClaimDialog({ open: true, service })}
                          >
                            Claim Service
                          </Button>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Pagination */}
            {availableMeta.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={availableMeta.page <= 1}
                  onClick={() => setAvailableMeta((prev) => ({ ...prev, page: prev.page - 1 }))}
                >
                  Previous
                </Button>
                <span className="py-2 px-4 text-sm text-gray-600">
                  Page {availableMeta.page} of {availableMeta.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={availableMeta.page >= availableMeta.totalPages}
                  onClick={() => setAvailableMeta((prev) => ({ ...prev, page: prev.page + 1 }))}
                >
                  Next
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Claim Dialog */}
      <Dialog open={claimDialog.open} onOpenChange={(open) => !open && setClaimDialog({ open: false, service: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Claim Service</DialogTitle>
            <DialogDescription>
              Claim <strong>{claimDialog.service?.name}</strong> for your office
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Notes (Optional)</label>
              <Textarea
                placeholder="Add any notes about this service at your office..."
                value={claimNotes}
                onChange={(e) => setClaimNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setClaimDialog({ open: false, service: null })}>
              Cancel
            </Button>
            <Button onClick={handleClaimService} disabled={processing}>
              {processing ? 'Claiming...' : 'Claim Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Revoke Dialog */}
      <Dialog open={revokeDialog.open} onOpenChange={(open) => !open && setRevokeDialog({ open: false, officeService: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Revoke Service</DialogTitle>
            <DialogDescription>
              Are you sure you want to revoke <strong>{revokeDialog.officeService?.service.name}</strong> from your office?
            </DialogDescription>
          </DialogHeader>
          <p className="text-sm text-gray-600">
            This will remove the service from your office list. You can claim it again later.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRevokeDialog({ open: false, officeService: null })}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleRevokeService} disabled={processing}>
              {processing ? 'Revoking...' : 'Revoke Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* View Service Detail Dialog */}
      <ServiceDetailDialog
        serviceId={viewDetailDialog.serviceId}
        open={viewDetailDialog.open}
        onOpenChange={(open) => !open && setViewDetailDialog({ open: false, serviceId: null })}
      />
    </div>
  );
}
