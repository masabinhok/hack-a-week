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
import { api, Office, OfficesResponse, OfficeCategory, OFFICE_TYPES } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';

const selectClassName = "flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50";

export default function OfficesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [offices, setOffices] = useState<Office[]>([]);
  const [categories, setCategories] = useState<OfficeCategory[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
  const [categoryFilter, setCategoryFilter] = useState(searchParams.get('categoryId') || '');
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; office: Office | null }>({
    open: false,
    office: null,
  });
  const [deleting, setDeleting] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchOffices();
  }, [page, typeFilter, categoryFilter]);

  const fetchCategories = async () => {
    try {
      const response = await api.getOfficeCategories();
      // Handle both direct array and wrapped response
      const data = Array.isArray(response) ? response : (response as any).data || [];
      setCategories(data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    }
  };

  const fetchOffices = async () => {
    setLoading(true);
    try {
      const response = await api.getOffices({
        page,
        limit: 20,
        search: search || undefined,
        type: typeFilter || undefined,
        categoryId: categoryFilter || undefined,
      });
      setOffices(response?.data || []);
      setMeta(response?.meta || { total: 0, page: 1, limit: 20, totalPages: 0 });
    } catch (error) {
      console.error('Failed to fetch offices:', error);
      setOffices([]);
      setMeta({ total: 0, page: 1, limit: 20, totalPages: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOffices();
  };

  const handleDelete = async () => {
    if (!deleteDialog.office) return;
    setDeleting(true);
    try {
      await api.deleteOffice(deleteDialog.office.id);
      setDeleteDialog({ open: false, office: null });
      fetchOffices();
    } catch (error: any) {
      alert(error.message || 'Failed to delete office');
    } finally {
      setDeleting(false);
    }
  };

  const getTypeBadge = (type: string) => {
    const option = OFFICE_TYPES.find((t) => t.value === type);
    return (
      <Badge variant="secondary" className="text-xs">
        {option?.label || type}
      </Badge>
    );
  };

  const getLocationString = (office: Office) => {
    if (!office.location) return '-';
    const parts = [];
    if (office.location.wardNumber) parts.push(`Ward ${office.location.wardNumber}`);
    if (office.location.municipalityName) parts.push(office.location.municipalityName);
    if (office.location.districtName) parts.push(office.location.districtName);
    return parts.join(', ') || '-';
  };

  const clearFilters = () => {
    setSearch('');
    setTypeFilter('');
    setCategoryFilter('');
    router.push('/offices');
  };

  return (
    <div>
      <AdminHeader
        title="Offices"
        description="Manage government offices"
        actions={
          <Link href="/offices/new">
            <Button>
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Add Office
            </Button>
          </Link>
        }
      />

      <div className="p-8">
        {/* Search & Filters */}
        <Card className="mb-6">
          <CardContent className="p-4">
            <form onSubmit={handleSearch} className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[200px]">
                <Input
                  placeholder="Search offices by name, ID, or address..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className={cn(selectClassName, "w-[220px]")}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                <option value="">All Office Types</option>
                {OFFICE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
              <select
                className={cn(selectClassName, "w-[180px]")}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="">All Categories</option>
                {Array.isArray(categories) && categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
              <Button type="submit" variant="secondary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </Button>
              {(search || typeFilter || categoryFilter) && (
                <Button type="button" variant="outline" onClick={clearFilters}>
                  Clear
                </Button>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Offices Table */}
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Office
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center">
                      <div className="flex items-center justify-center gap-2 text-gray-500">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Loading offices...
                      </div>
                    </td>
                  </tr>
                ) : offices.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-gray-500">
                      No offices found
                    </td>
                  </tr>
                ) : (
                  offices.map((office) => (
                    <tr key={office.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div>
                          <Link
                            href={`/offices/${office.id}`}
                            className="font-medium text-gray-900 hover:text-blue-600"
                          >
                            {office.name}
                          </Link>
                          {office.nameNepali && (
                            <div className="text-sm text-gray-500">{office.nameNepali}</div>
                          )}
                          <div className="text-xs text-gray-400 mt-1">
                            ID: {office.officeId}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {getTypeBadge(office.type)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-600">
                        {getLocationString(office)}
                        {office.mapUrl && (
                          <a
                            href={office.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-xs text-blue-600 hover:underline mt-1"
                          >
                            View on Map →
                          </a>
                        )}
                      </td>
                      <td className="px-4 py-4 text-sm">
                        {office.contact && (
                          <div className="text-gray-600">{office.contact}</div>
                        )}
                        {office.email && (
                          <div className="text-gray-500 text-xs">{office.email}</div>
                        )}
                      </td>
                      <td className="px-4 py-4">
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
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {formatDate(office.updatedAt)}
                      </td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/offices/${office.id}`}>
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Button>
                          </Link>
                          <Link href={`/offices/${office.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteDialog({ open: true, office })}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
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
          {meta.totalPages > 1 && (
            <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Showing {(meta.page - 1) * meta.limit + 1} to{' '}
                {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} offices
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page <= 1}
                  onClick={() => router.push(`/offices?page=${meta.page - 1}`)}
                >
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={meta.page >= meta.totalPages}
                  onClick={() => router.push(`/offices?page=${meta.page + 1}`)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ open, office: null })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Office</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleteDialog.office?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, office: null })}
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
    </div>
  );
}
