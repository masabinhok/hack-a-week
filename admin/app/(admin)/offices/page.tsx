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
import { api, Office, OFFICE_TYPES } from '@/lib/api';
import { formatDate, cn } from '@/lib/utils';

const selectClassName = "flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50";

interface LocationData {
  provinces: { id: number; name: string }[];
  districts: { id: number; name: string }[];
  municipalities: { id: number; name: string }[];
  wards: { id: number; wardNumber: number }[];
}

export default function OfficesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [offices, setOffices] = useState<Office[]>([]);
  const [meta, setMeta] = useState({ total: 0, page: 1, limit: 20, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [typeFilter, setTypeFilter] = useState(searchParams.get('type') || '');
  
  // Location filters
  const [locationData, setLocationData] = useState<LocationData>({
    provinces: [],
    districts: [],
    municipalities: [],
    wards: [],
  });
  const [provinceFilter, setProvinceFilter] = useState(searchParams.get('provinceId') || '');
  const [districtFilter, setDistrictFilter] = useState(searchParams.get('districtId') || '');
  const [municipalityFilter, setMunicipalityFilter] = useState(searchParams.get('municipalityId') || '');
  const [wardFilter, setWardFilter] = useState(searchParams.get('wardId') || '');
  
  const [deleteDialog, setDeleteDialog] = useState<{ open: boolean; office: Office | null }>({
    open: false,
    office: null,
  });
  const [deleting, setDeleting] = useState(false);

  const page = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    fetchProvinces();
  }, []);

  useEffect(() => {
    fetchOffices();
  }, [page, typeFilter, provinceFilter, districtFilter, municipalityFilter, wardFilter]);

  // Cascading location fetches
  useEffect(() => {
    if (provinceFilter) {
      fetchDistricts(parseInt(provinceFilter));
    } else {
      setLocationData(prev => ({ ...prev, districts: [], municipalities: [], wards: [] }));
      setDistrictFilter('');
      setMunicipalityFilter('');
      setWardFilter('');
    }
  }, [provinceFilter]);

  useEffect(() => {
    if (districtFilter) {
      fetchMunicipalities(parseInt(districtFilter));
    } else {
      setLocationData(prev => ({ ...prev, municipalities: [], wards: [] }));
      setMunicipalityFilter('');
      setWardFilter('');
    }
  }, [districtFilter]);

  useEffect(() => {
    if (municipalityFilter) {
      fetchWards(parseInt(municipalityFilter));
    } else {
      setLocationData(prev => ({ ...prev, wards: [] }));
      setWardFilter('');
    }
  }, [municipalityFilter]);

  const fetchProvinces = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/locations/provinces`);
      const data = await response.json();
      const provinces = Array.isArray(data) ? data : data.data || [];
      setLocationData(prev => ({ ...prev, provinces }));
    } catch (error) {
      console.error('Failed to fetch provinces:', error);
    }
  };

  const fetchDistricts = async (provinceId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/locations/provinces/${provinceId}/districts`);
      const data = await response.json();
      const districts = Array.isArray(data) ? data : data.data || [];
      setLocationData(prev => ({ ...prev, districts, municipalities: [], wards: [] }));
    } catch (error) {
      console.error('Failed to fetch districts:', error);
    }
  };

  const fetchMunicipalities = async (districtId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/locations/districts/${districtId}/municipalities`);
      const data = await response.json();
      const municipalities = Array.isArray(data) ? data : data.data || [];
      setLocationData(prev => ({ ...prev, municipalities, wards: [] }));
    } catch (error) {
      console.error('Failed to fetch municipalities:', error);
    }
  };

  const fetchWards = async (municipalityId: number) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1'}/locations/municipalities/${municipalityId}/wards`);
      const data = await response.json();
      const wards = Array.isArray(data) ? data : data.data || [];
      setLocationData(prev => ({ ...prev, wards }));
    } catch (error) {
      console.error('Failed to fetch wards:', error);
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
        provinceId: provinceFilter ? parseInt(provinceFilter) : undefined,
        districtId: districtFilter ? parseInt(districtFilter) : undefined,
        municipalityId: municipalityFilter ? parseInt(municipalityFilter) : undefined,
        wardId: wardFilter ? parseInt(wardFilter) : undefined,
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
    setProvinceFilter('');
    setDistrictFilter('');
    setMunicipalityFilter('');
    setWardFilter('');
    router.push('/offices');
  };

  const hasFilters = search || typeFilter || provinceFilter || districtFilter || municipalityFilter || wardFilter;

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
          <CardContent className="p-4 space-y-4">
            {/* Search Row */}
            <form onSubmit={handleSearch} className="flex gap-4 flex-wrap">
              <div className="flex-1 min-w-[300px]">
                <Input
                  placeholder="Search by name, location (e.g., 'Kathmandu ward 13'), address..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className={cn(selectClassName, "w-[200px]")}
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
              <Button type="submit" variant="secondary">
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                Search
              </Button>
              {hasFilters && (
                <Button type="button" variant="outline" onClick={clearFilters}>
                  Clear All
                </Button>
              )}
            </form>

            {/* Location Filters Row */}
            <div className="flex gap-3 flex-wrap items-center pt-2 border-t border-gray-100">
              <span className="text-sm text-gray-500 font-medium">Filter by location:</span>
              <select
                className={cn(selectClassName, "w-[160px]")}
                value={provinceFilter}
                onChange={(e) => setProvinceFilter(e.target.value)}
              >
                <option value="">All Provinces</option>
                {Array.isArray(locationData.provinces) && locationData.provinces.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </select>
              <select
                className={cn(selectClassName, "w-[160px]")}
                value={districtFilter}
                onChange={(e) => setDistrictFilter(e.target.value)}
                disabled={!provinceFilter}
              >
                <option value="">All Districts</option>
                {Array.isArray(locationData.districts) && locationData.districts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
              <select
                className={cn(selectClassName, "w-[180px]")}
                value={municipalityFilter}
                onChange={(e) => setMunicipalityFilter(e.target.value)}
                disabled={!districtFilter}
              >
                <option value="">All Municipalities</option>
                {Array.isArray(locationData.municipalities) && locationData.municipalities.map((municipality) => (
                  <option key={municipality.id} value={municipality.id}>
                    {municipality.name}
                  </option>
                ))}
              </select>
              <select
                className={cn(selectClassName, "w-[120px]")}
                value={wardFilter}
                onChange={(e) => setWardFilter(e.target.value)}
                disabled={!municipalityFilter}
              >
                <option value="">All Wards</option>
                {Array.isArray(locationData.wards) && locationData.wards.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    Ward {ward.wardNumber}
                  </option>
                ))}
              </select>
            </div>
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
