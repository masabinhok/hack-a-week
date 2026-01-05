'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import AdminHeader from '@/components/AdminHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { api, OfficeDetail, OFFICE_TYPES, OfficeAdminCredentials } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth';

export default function OfficeDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { isAdmin, isOfficeAdmin } = useAuth();
  const [office, setOffice] = useState<OfficeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);
  
  // Reset password state
  const [resetPasswordDialog, setResetPasswordDialog] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [newCredentials, setNewCredentials] = useState<OfficeAdminCredentials | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

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

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.deleteOffice(officeId);
      router.push('/offices');
    } catch (error: any) {
      alert(error.message || 'Failed to delete office');
    } finally {
      setDeleting(false);
    }
  };

  const handleResetPassword = async () => {
    setResettingPassword(true);
    try {
      const result = await api.resetOfficeAdminPassword(officeId);
      setNewCredentials(result.credentials);
    } catch (error: any) {
      alert(error.message || 'Failed to reset password');
      setResetPasswordDialog(false);
    } finally {
      setResettingPassword(false);
    }
  };

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleCloseResetDialog = () => {
    setResetPasswordDialog(false);
    setNewCredentials(null);
  };

  const getTypeBadge = (type: string) => {
    const option = OFFICE_TYPES.find((t) => t.value === type);
    return option?.label || type;
  };

  const getLocationString = () => {
    if (!office?.location) return '-';
    const parts = [];
    if (office.location.wardNumber) parts.push(`Ward ${office.location.wardNumber}`);
    if (office.location.municipalityName) parts.push(office.location.municipalityName);
    if (office.location.districtName) parts.push(office.location.districtName);
    if (office.location.provinceName) parts.push(office.location.provinceName);
    return parts.join(', ') || '-';
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
        title={office.name}
        description={office.nameNepali || office.officeId}
        actions={
          <div className="flex gap-2">
            <Link href={`/offices/${office.id}/edit`}>
              <Button variant="outline">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit
              </Button>
            </Link>
            {isAdmin && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setResetPasswordDialog(true)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                  </svg>
                  Reset Password
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialog(true)}
                >
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </Button>
              </>
            )}
          </div>
        }
      />

      <div className="p-8 space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Office ID</dt>
                <dd className="mt-1 text-sm text-gray-900">{office.officeId}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Type</dt>
                <dd className="mt-1">
                  <Badge variant="secondary">{getTypeBadge(office.type)}</Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Category</dt>
                <dd className="mt-1 text-sm text-gray-900">{office.category?.name || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Status</dt>
                <dd className="mt-1">
                  <Badge
                    variant={office.isActive ? 'default' : 'secondary'}
                    className={cn(
                      office.isActive
                        ? 'bg-green-100 text-green-700 hover:bg-green-100'
                        : 'bg-gray-100 text-gray-700'
                    )}
                  >
                    {office.isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(office.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="mt-1 text-sm text-gray-900">{formatDate(office.updatedAt)}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Location */}
        <Card>
          <CardHeader>
            <CardTitle>Location</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Administrative Location</dt>
                <dd className="mt-1 text-sm text-gray-900">{getLocationString()}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Address</dt>
                <dd className="mt-1 text-sm text-gray-900">{office.address}</dd>
                {office.addressNepali && (
                  <dd className="text-sm text-gray-500">{office.addressNepali}</dd>
                )}
              </div>
              {office.nearestLandmark && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Nearest Landmark</dt>
                  <dd className="mt-1 text-sm text-gray-900">{office.nearestLandmark}</dd>
                </div>
              )}
              {office.publicTransport && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Public Transport</dt>
                  <dd className="mt-1 text-sm text-gray-900">{office.publicTransport}</dd>
                </div>
              )}
            </dl>

            {/* Map Embed */}
            <div className="mt-4">
              <dt className="text-sm font-medium text-gray-500 mb-2">Map Location</dt>
              <div className="rounded-lg overflow-hidden border border-gray-200">
                {office.mapUrl ? (
                  // If mapUrl is provided, use it (Google Maps embed or link)
                  office.mapUrl.includes('embed') || office.mapUrl.includes('maps.google.com/maps?') ? (
                    <iframe
                      src={office.mapUrl.includes('embed') ? office.mapUrl : office.mapUrl.replace('maps.google.com/maps?', 'maps.google.com/maps?output=embed&')}
                      width="100%"
                      height="350"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    // Non-embed URL - show OpenStreetMap with link to Google Maps
                    <>
                      <iframe
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=85.2%2C27.6%2C85.4%2C27.8&layer=mapnik&marker=27.7172%2C85.324`}
                        width="100%"
                        height="300"
                        style={{ border: 0 }}
                        loading="lazy"
                      />
                      <div className="p-2 bg-gray-50 border-t flex justify-between items-center">
                        <span className="text-sm text-gray-600">📍 {office.address}</span>
                        <a
                          href={office.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-blue-600 hover:underline"
                        >
                          Open in Google Maps →
                        </a>
                      </div>
                    </>
                  )
                ) : (
                  // No mapUrl - show OpenStreetMap search by address
                  <>
                    <iframe
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=85.2%2C27.6%2C85.4%2C27.8&layer=mapnik&marker=27.7172%2C85.324`}
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      loading="lazy"
                    />
                    <div className="p-2 bg-gray-50 border-t flex justify-between items-center">
                      <span className="text-sm text-gray-600">📍 {office.address}</span>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(office.address + (office.location?.districtName ? ', ' + office.location.districtName : '') + ', Nepal')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline"
                      >
                        Search on Google Maps →
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Primary Contact</dt>
                <dd className="mt-1 text-sm text-gray-900">{office.contact || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Alternate Contact</dt>
                <dd className="mt-1 text-sm text-gray-900">{office.alternateContact || '-'}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {office.email ? (
                    <a href={`mailto:${office.email}`} className="text-blue-600 hover:underline">
                      {office.email}
                    </a>
                  ) : '-'}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Website</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {office.website ? (
                    <a href={office.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {office.website}
                    </a>
                  ) : '-'}
                </dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        {/* Facilities */}
        {office.facilities && office.facilities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Facilities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {office.facilities.map((facility, index) => (
                  <Badge key={index} variant="outline">
                    {facility}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Ratings */}
        {office.ratings && (
          <Card>
            <CardHeader>
              <CardTitle>Ratings</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Average Rating</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {office.ratings.averageRating.toFixed(1)} / 5
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Total Reviews</dt>
                  <dd className="mt-1 text-sm text-gray-900">{office.ratings.totalReviews}</dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog} onOpenChange={setDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Office</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{office.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? 'Deleting...' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset Password Dialog */}
      <Dialog open={resetPasswordDialog} onOpenChange={(open) => !open && handleCloseResetDialog()}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {newCredentials ? (
                <span className="flex items-center gap-2 text-green-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Password Reset Successfully
                </span>
              ) : (
                'Reset Office Admin Password'
              )}
            </DialogTitle>
            <DialogDescription>
              {newCredentials
                ? 'New credentials have been generated. Please save them - the password will only be shown once.'
                : `This will generate a new password for the office admin of "${office.name}". The old password will no longer work.`}
            </DialogDescription>
          </DialogHeader>

          {newCredentials ? (
            <div className="space-y-4 py-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm text-amber-800">
                    <strong>Important:</strong> Copy these credentials now. The password cannot be recovered after closing this dialog.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={newCredentials.username}
                      readOnly
                      className="font-mono bg-gray-50"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(newCredentials.username, 'username')}
                    >
                      {copiedField === 'username' ? (
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </Button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={newCredentials.password}
                      readOnly
                      className="font-mono bg-gray-50"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopy(newCredentials.password, 'password')}
                    >
                      {copiedField === 'password' ? (
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <DialogFooter>
            {newCredentials ? (
              <Button onClick={handleCloseResetDialog} className="w-full">
                I&apos;ve Saved the Credentials
              </Button>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleCloseResetDialog}
                  disabled={resettingPassword}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleResetPassword}
                  disabled={resettingPassword}
                >
                  {resettingPassword ? 'Resetting...' : 'Reset Password'}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
