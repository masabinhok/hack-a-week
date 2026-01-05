'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import AdminHeader from '@/components/AdminHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { api, ServiceRequest, ServiceRequestStats, PRIORITY_OPTIONS } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

export default function ServiceRequestsPage() {
  const router = useRouter();
  const { isAdmin, isOfficeAdmin } = useAuth();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [stats, setStats] = useState<ServiceRequestStats | null>(null);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  
  // Dialog states
  const [approveDialog, setApproveDialog] = useState<{ open: boolean; request: ServiceRequest | null }>({
    open: false,
    request: null,
  });
  const [rejectDialog, setRejectDialog] = useState<{ open: boolean; request: ServiceRequest | null }>({
    open: false,
    request: null,
  });
  const [reviewNotes, setReviewNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);

  const page = meta.page;

  const fetchRequests = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.getServiceRequests({
        page,
        limit: 20,
        status: statusFilter === 'ALL' ? undefined : statusFilter,
      });
      setRequests(response.data || []);
      setMeta(response.meta || { total: 0, page: 1, limit: 20, totalPages: 0 });
    } catch (error: any) {
      console.error('Failed to fetch service requests:', error);
      // Handle gracefully - set empty results
      setRequests([]);
      setMeta({ total: 0, page: 1, limit: 20, totalPages: 0 });
      
      // Only show error if it's not a "not found" or "no results" scenario
      if (error?.status !== 404) {
        // You could add a toast notification here if available
        console.warn('Error fetching service requests:', error.message);
      }
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  const fetchStats = useCallback(async () => {
    try {
      const statsData = await api.getServiceRequestStats();
      setStats(statsData);
    } catch (error: any) {
      console.error('Failed to fetch stats:', error);
      // Set default stats on error
      setStats(null);
      
      // Only log warning for non-404 errors
      if (error?.status !== 404) {
        console.warn('Error fetching stats:', error.message);
      }
    }
  }, []);

  useEffect(() => {
    fetchRequests();
    if (isAdmin) {
      fetchStats();
    }
  }, [fetchRequests, fetchStats, isAdmin]);

  const handleApprove = async () => {
    if (!approveDialog.request) return;
    setProcessing(true);
    try {
      await api.approveServiceRequest(approveDialog.request.id, { reviewNotes: reviewNotes || undefined });
      setApproveDialog({ open: false, request: null });
      setReviewNotes('');
      fetchRequests();
      if (isAdmin) fetchStats();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to approve request';
      alert(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!rejectDialog.request || !rejectionReason.trim()) return;
    setProcessing(true);
    try {
      await api.rejectServiceRequest(rejectDialog.request.id, {
        rejectionReason,
        reviewNotes: reviewNotes || undefined,
      });
      setRejectDialog({ open: false, request: null });
      setRejectionReason('');
      setReviewNotes('');
      fetchRequests();
      if (isAdmin) fetchStats();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to reject request';
      alert(errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">Pending</Badge>;
      case 'APPROVED':
        return <Badge className="bg-green-100 text-green-800 border-green-300">Approved</Badge>;
      case 'REJECTED':
        return <Badge className="bg-red-100 text-red-800 border-red-300">Rejected</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority?: string) => {
    const option = PRIORITY_OPTIONS.find((p) => p.value === priority);
    if (!option) return null;
    return <span className={cn('px-2 py-0.5 text-xs rounded-full', option.color)}>{option.label}</span>;
  };

  return (
    <div>
      <AdminHeader
        title="Service Requests"
        description={isAdmin ? 'Review and manage service requests from office admins' : 'View your service requests'}
        actions={
          isOfficeAdmin && (
            <Button onClick={() => router.push('/service-requests/new')}>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Request New Service
            </Button>
          )
        }
      />

      <div className="p-8">
        {/* Stats Cards (Admin Only) */}
        {isAdmin && stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-blue-700">{stats.total}</div>
                <div className="text-sm text-blue-600">Total Requests</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-yellow-700">{stats.pending}</div>
                <div className="text-sm text-yellow-600">Pending Review</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-green-700">{stats.approved}</div>
                <div className="text-sm text-green-600">Approved</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
              <CardContent className="p-4">
                <div className="text-2xl font-bold text-red-700">{stats.rejected}</div>
                <div className="text-sm text-red-600">Rejected</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Status Filter */}
        <div className="flex gap-2 mb-6">
          {['ALL', 'PENDING', 'APPROVED', 'REJECTED'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status as any)}
            >
              {status === 'ALL' ? 'All' : status.charAt(0) + status.slice(1).toLowerCase()}
            </Button>
          ))}
        </div>

        {/* Requests List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-nepal-blue-600"></div>
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Service Requests</h3>
              <p className="text-gray-500">
                {isOfficeAdmin
                  ? 'You haven\'t submitted any service requests yet.'
                  : 'There are no service requests to review.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <Card key={request.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{request.serviceName}</h3>
                        {getStatusBadge(request.status)}
                        {getPriorityBadge(request.priority)}
                      </div>
                      
                      {request.serviceDescription && (
                        <p className="text-gray-600 mb-3">{request.serviceDescription}</p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Requested by:</span>
                          <span className="ml-2 font-medium">{request.requester?.username || 'Unknown'}</span>
                        </div>
                        {request.office && (
                          <div>
                            <span className="text-gray-500">Office:</span>
                            <span className="ml-2 font-medium">{request.office.name}</span>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-500">Submitted:</span>
                          <span className="ml-2 font-medium">{formatDate(request.createdAt)}</span>
                        </div>
                        {request.reviewedAt && (
                          <div>
                            <span className="text-gray-500">Reviewed:</span>
                            <span className="ml-2 font-medium">{formatDate(request.reviewedAt)}</span>
                          </div>
                        )}
                      </div>

                      {request.justification && (
                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                          <span className="text-sm text-gray-500">Justification:</span>
                          <p className="text-sm text-gray-700 mt-1">{request.justification}</p>
                        </div>
                      )}

                      {request.rejectionReason && (
                        <div className="mt-3 p-3 bg-red-50 rounded-lg border border-red-200">
                          <span className="text-sm text-red-600 font-medium">Rejection Reason:</span>
                          <p className="text-sm text-red-700 mt-1">{request.rejectionReason}</p>
                        </div>
                      )}

                      {request.approvedService && (
                        <div className="mt-3 p-3 bg-green-50 rounded-lg border border-green-200">
                          <span className="text-sm text-green-600 font-medium">Created Service:</span>
                          <p className="text-sm text-green-700 mt-1">
                            {request.approvedService.name} ({request.approvedService.serviceId})
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons (Admin Only, Pending Requests) */}
                    {isAdmin && request.status === 'PENDING' && (
                      <div className="flex gap-2 ml-4">
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-green-600 border-green-300 hover:bg-green-50"
                          onClick={() => setApproveDialog({ open: true, request })}
                        >
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 border-red-300 hover:bg-red-50"
                          onClick={() => setRejectDialog({ open: true, request })}
                        >
                          Reject
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Pagination */}
        {meta.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setMeta((prev) => ({ ...prev, page: prev.page - 1 }))}
            >
              Previous
            </Button>
            <span className="py-2 px-4 text-sm text-gray-600">
              Page {page} of {meta.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= meta.totalPages}
              onClick={() => setMeta((prev) => ({ ...prev, page: prev.page + 1 }))}
            >
              Next
            </Button>
          </div>
        )}
      </div>

      {/* Approve Dialog */}
      <Dialog open={approveDialog.open} onOpenChange={(open) => !open && setApproveDialog({ open: false, request: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Approve Service Request</DialogTitle>
            <DialogDescription>
              This will create a new service: <strong>{approveDialog.request?.serviceName}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Review Notes (Optional)</label>
              <Textarea
                placeholder="Add any notes for the requester..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setApproveDialog({ open: false, request: null })}>
              Cancel
            </Button>
            <Button onClick={handleApprove} disabled={processing} className="bg-green-600 hover:bg-green-700">
              {processing ? 'Approving...' : 'Approve & Create Service'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject Dialog */}
      <Dialog open={rejectDialog.open} onOpenChange={(open) => !open && setRejectDialog({ open: false, request: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Service Request</DialogTitle>
            <DialogDescription>
              Please provide a reason for rejecting: <strong>{rejectDialog.request?.serviceName}</strong>
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Rejection Reason (Required)</label>
              <Textarea
                placeholder="Explain why this request is being rejected..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="mt-1"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Additional Notes (Optional)</label>
              <Textarea
                placeholder="Add any additional notes..."
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog({ open: false, request: null })}>
              Cancel
            </Button>
            <Button
              onClick={handleReject}
              disabled={processing || !rejectionReason.trim()}
              variant="destructive"
            >
              {processing ? 'Rejecting...' : 'Reject Request'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
