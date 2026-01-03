'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  api,
  OfficeCategory,
  OfficeDetail,
  CreateOfficeData,
  OFFICE_TYPES,
} from '@/lib/api';
import { cn } from '@/lib/utils';

interface OfficeFormProps {
  office?: OfficeDetail;
}

interface LocationData {
  provinces: { id: number; name: string }[];
  districts: { id: number; name: string }[];
  municipalities: { id: number; name: string }[];
  wards: { id: number; wardNumber: number }[];
}

const selectClassName = "flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50";

export default function OfficeForm({ office }: OfficeFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<OfficeCategory[]>([]);
  const [locationData, setLocationData] = useState<LocationData>({
    provinces: [],
    districts: [],
    municipalities: [],
    wards: [],
  });
  const [facilitiesInput, setFacilitiesInput] = useState('');

  // Form state
  const [formData, setFormData] = useState<CreateOfficeData>({
    officeId: office?.officeId || '',
    categoryId: office?.categoryId || '',
    name: office?.name || '',
    nameNepali: office?.nameNepali || '',
    type: office?.type || '',
    address: office?.address || '',
    addressNepali: office?.addressNepali || '',
    contact: office?.contact || '',
    alternateContact: office?.alternateContact || '',
    email: office?.email || '',
    website: office?.website || '',
    mapUrl: office?.mapUrl || '',
    photoUrls: office?.photoUrls || [],
    facilities: office?.facilities || [],
    nearestLandmark: office?.nearestLandmark || '',
    publicTransport: office?.publicTransport || '',
    isActive: office?.isActive ?? true,
    location: {
      provinceId: office?.location?.provinceId,
      districtId: office?.location?.districtId,
      municipalityId: office?.location?.municipalityId,
      wardId: office?.location?.wardId,
    },
  });

  useEffect(() => {
    fetchCategories();
    fetchLocations();
  }, []);

  // Load dependent location data when editing an existing office
  useEffect(() => {
    const loadExistingLocationData = async () => {
      if (office?.location) {
        if (office.location.provinceId) {
          await fetchDistricts(office.location.provinceId);
        }
        if (office.location.districtId) {
          await fetchMunicipalities(office.location.districtId);
        }
        if (office.location.municipalityId) {
          await fetchWards(office.location.municipalityId);
        }
      }
    };
    loadExistingLocationData();
  }, [office]);

  useEffect(() => {
    if (office?.facilities) {
      setFacilitiesInput(office.facilities.join(', '));
    }
  }, [office]);

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

  const fetchLocations = async () => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
      const provincesRes = await fetch(`${API_BASE_URL}/locations/provinces`);
      const provincesData = await provincesRes.json();
      // Handle both direct array and wrapped response
      const provinces = Array.isArray(provincesData) ? provincesData : provincesData?.data || [];

      setLocationData({
        provinces,
        districts: [],
        municipalities: [],
        wards: [],
      });
    } catch (error) {
      console.error('Failed to fetch locations:', error);
      setLocationData({ provinces: [], districts: [], municipalities: [], wards: [] });
    }
  };

  const fetchDistricts = async (provinceId: number) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
      const response = await fetch(`${API_BASE_URL}/locations/provinces/${provinceId}/districts`);
      const data = await response.json();
      const districts = Array.isArray(data) ? data : data?.data || [];
      setLocationData((prev) => ({ ...prev, districts, municipalities: [], wards: [] }));
    } catch (error) {
      console.error('Failed to fetch districts:', error);
      setLocationData((prev) => ({ ...prev, districts: [], municipalities: [], wards: [] }));
    }
  };

  const fetchMunicipalities = async (districtId: number) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
      const response = await fetch(`${API_BASE_URL}/locations/districts/${districtId}/municipalities`);
      const data = await response.json();
      const municipalities = Array.isArray(data) ? data : data?.data || [];
      setLocationData((prev) => ({ ...prev, municipalities, wards: [] }));
    } catch (error) {
      console.error('Failed to fetch municipalities:', error);
      setLocationData((prev) => ({ ...prev, municipalities: [], wards: [] }));
    }
  };

  const fetchWards = async (municipalityId: number) => {
    try {
      const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1';
      const response = await fetch(`${API_BASE_URL}/locations/municipalities/${municipalityId}/wards`);
      const data = await response.json();
      const wards = Array.isArray(data) ? data : data?.data || [];
      setLocationData((prev) => ({ ...prev, wards }));
    } catch (error) {
      console.error('Failed to fetch wards:', error);
      setLocationData((prev) => ({ ...prev, wards: [] }));
    }
  };

  const handleChange = (field: keyof CreateOfficeData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleLocationChange = (field: keyof NonNullable<CreateOfficeData['location']>, value: number | undefined) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location,
        [field]: value,
      },
    }));

    // Load dependent data based on selection
    if (field === 'provinceId' && value) {
      fetchDistricts(value);
      // Clear dependent fields
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          provinceId: value,
          districtId: undefined,
          municipalityId: undefined,
          wardId: undefined,
        },
      }));
    } else if (field === 'districtId' && value) {
      fetchMunicipalities(value);
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          districtId: value,
          municipalityId: undefined,
          wardId: undefined,
        },
      }));
    } else if (field === 'municipalityId' && value) {
      fetchWards(value);
      setFormData((prev) => ({
        ...prev,
        location: {
          ...prev.location,
          municipalityId: value,
          wardId: undefined,
        },
      }));
    }
  };

  const handleFacilitiesChange = (input: string) => {
    setFacilitiesInput(input);
    const facilities = input
      .split(',')
      .map((f) => f.trim())
      .filter((f) => f.length > 0);
    handleChange('facilities', facilities);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (office) {
        await api.updateOffice(office.id, formData);
      } else {
        await api.createOffice(formData);
      }
      router.push('/offices');
      router.refresh();
    } catch (error: any) {
      alert(error.message || 'Failed to save office');
    } finally {
      setLoading(false);
    }
  };

  const generateOfficeId = () => {
    const typePrefix = formData.type?.substring(0, 3).toUpperCase() || 'OFF';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    handleChange('officeId', `${typePrefix}-${random}`);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Office ID */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Office ID <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <Input
                  value={formData.officeId}
                  onChange={(e) => handleChange('officeId', e.target.value)}
                  placeholder="e.g., DAO-KTMN01"
                  required
                />
                <Button type="button" variant="outline" onClick={generateOfficeId}>
                  Generate
                </Button>
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <select
                className={selectClassName}
                value={formData.categoryId}
                onChange={(e) => handleChange('categoryId', e.target.value)}
                required
              >
                <option value="">Select category</option>
                {Array.isArray(categories) && categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Office Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Office Type <span className="text-red-500">*</span>
              </label>
              <select
                className={selectClassName}
                value={formData.type}
                onChange={(e) => handleChange('type', e.target.value)}
                required
              >
                <option value="">Select office type</option>
                {OFFICE_TYPES.map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                className={selectClassName}
                value={formData.isActive ? 'active' : 'inactive'}
                onChange={(e) => handleChange('isActive', e.target.value === 'active')}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Name (English) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name (English) <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="e.g., District Administration Office, Kathmandu"
                required
              />
            </div>

            {/* Name (Nepali) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Name (Nepali)
              </label>
              <Input
                value={formData.nameNepali || ''}
                onChange={(e) => handleChange('nameNepali', e.target.value)}
                placeholder="e.g., जिल्ला प्रशासन कार्यालय, काठमाडौँ"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Location */}
      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Province */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Province
              </label>
              <select
                className={selectClassName}
                value={formData.location?.provinceId?.toString() || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : undefined;
                  handleLocationChange('provinceId', value);
                }}
              >
                <option value="">Select province</option>
                {Array.isArray(locationData.provinces) && locationData.provinces.map((province) => (
                  <option key={province.id} value={province.id.toString()}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>

            {/* District */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                District
              </label>
              <select
                className={selectClassName}
                value={formData.location?.districtId?.toString() || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : undefined;
                  handleLocationChange('districtId', value);
                }}
                disabled={!formData.location?.provinceId}
              >
                <option value="">Select district</option>
                {Array.isArray(locationData.districts) && locationData.districts.map((district) => (
                  <option key={district.id} value={district.id.toString()}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Municipality */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Municipality
              </label>
              <select
                className={selectClassName}
                value={formData.location?.municipalityId?.toString() || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : undefined;
                  handleLocationChange('municipalityId', value);
                }}
                disabled={!formData.location?.districtId}
              >
                <option value="">Select municipality</option>
                {Array.isArray(locationData.municipalities) && locationData.municipalities.map((municipality) => (
                  <option key={municipality.id} value={municipality.id.toString()}>
                    {municipality.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ward */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Ward
              </label>
              <select
                className={selectClassName}
                value={formData.location?.wardId?.toString() || ''}
                onChange={(e) => {
                  const value = e.target.value ? parseInt(e.target.value) : undefined;
                  handleLocationChange('wardId', value);
                }}
                disabled={!formData.location?.municipalityId}
              >
                <option value="">Select ward</option>
                {Array.isArray(locationData.wards) && locationData.wards.map((ward) => (
                  <option key={ward.id} value={ward.id.toString()}>
                    Ward {ward.wardNumber}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Address (English) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address (English) <span className="text-red-500">*</span>
              </label>
              <Input
                value={formData.address}
                onChange={(e) => handleChange('address', e.target.value)}
                placeholder="e.g., Putalisadak, Kathmandu"
                required
              />
            </div>

            {/* Address (Nepali) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address (Nepali)
              </label>
              <Input
                value={formData.addressNepali || ''}
                onChange={(e) => handleChange('addressNepali', e.target.value)}
                placeholder="e.g., पुतलीसडक, काठमाडौँ"
              />
            </div>

            {/* Nearest Landmark */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nearest Landmark
              </label>
              <Input
                value={formData.nearestLandmark || ''}
                onChange={(e) => handleChange('nearestLandmark', e.target.value)}
                placeholder="e.g., Near Ratna Park"
              />
            </div>

            {/* Public Transport */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Public Transport Access
              </label>
              <Input
                value={formData.publicTransport || ''}
                onChange={(e) => handleChange('publicTransport', e.target.value)}
                placeholder="e.g., Bus stops at Ratna Park"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle>Contact Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Primary Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Primary Contact
              </label>
              <Input
                value={formData.contact || ''}
                onChange={(e) => handleChange('contact', e.target.value)}
                placeholder="e.g., 01-4123456"
              />
            </div>

            {/* Alternate Contact */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alternate Contact
              </label>
              <Input
                value={formData.alternateContact || ''}
                onChange={(e) => handleChange('alternateContact', e.target.value)}
                placeholder="e.g., 01-4123457"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email
              </label>
              <Input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                placeholder="e.g., info@dao-kathmandu.gov.np"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website
              </label>
              <Input
                type="url"
                value={formData.website || ''}
                onChange={(e) => handleChange('website', e.target.value)}
                placeholder="e.g., https://dao-kathmandu.gov.np"
              />
            </div>

            {/* Map URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Map Location URL
              </label>
              <Input
                type="url"
                value={formData.mapUrl || ''}
                onChange={(e) => handleChange('mapUrl', e.target.value)}
                placeholder="e.g., https://maps.google.com/maps?q=27.7172,85.3240 or Google Maps embed URL"
              />
              <p className="text-xs text-gray-500 mt-1">
                Paste a Google Maps link or embed URL for this office location
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Information */}
      <Card>
        <CardHeader>
          <CardTitle>Additional Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Facilities */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Facilities (comma-separated)
            </label>
            <Input
              value={facilitiesInput}
              onChange={(e) => handleFacilitiesChange(e.target.value)}
              placeholder="e.g., Parking, Wheelchair Access, ATM, Canteen"
            />
            {formData.facilities && formData.facilities.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.facilities.map((facility, index) => (
                  <Badge key={index} variant="secondary">
                    {facility}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/offices')}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : office ? (
            'Update Office'
          ) : (
            'Create Office'
          )}
        </Button>
      </div>
    </form>
  );
}
