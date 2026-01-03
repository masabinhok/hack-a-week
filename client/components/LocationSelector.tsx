'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { Province, District, Municipality, Ward } from '@/lib/api';

interface LocationSelectorProps {
  onClose: () => void;
  officeType: string;
}

export default function LocationSelector({ onClose, officeType }: LocationSelectorProps) {
  const [step, setStep] = useState(1);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  
  const [selectedProvince, setSelectedProvince] = useState<number | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<number | null>(null);
  const [selectedMunicipality, setSelectedMunicipality] = useState<number | null>(null);
  const [selectedWard, setSelectedWard] = useState<number | null>(null);

  const [loading, setLoading] = useState(false);

  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

  const loadProvinces = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/locations/provinces`);
      const data = await res.json();
      setProvinces(data);
    } catch (error) {
      console.error('Failed to load provinces:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDistricts = async (provinceId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/locations/provinces/${provinceId}/districts`);
      const data = await res.json();
      setDistricts(data);
    } catch (error) {
      console.error('Failed to load districts:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadMunicipalities = async (districtId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/locations/districts/${districtId}/municipalities`);
      const data = await res.json();
      setMunicipalities(data);
    } catch (error) {
      console.error('Failed to load municipalities:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadWards = async (municipalityId: number) => {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/locations/municipalities/${municipalityId}/wards`);
      const data = await res.json();
      setWards(data);
    } catch (error) {
      console.error('Failed to load wards:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleProvinceSelect = (provinceId: number) => {
    setSelectedProvince(provinceId);
    setSelectedDistrict(null);
    setSelectedMunicipality(null);
    setSelectedWard(null);
    loadDistricts(provinceId);
    setStep(2);
  };

  const handleDistrictSelect = (districtId: number) => {
    setSelectedDistrict(districtId);
    setSelectedMunicipality(null);
    setSelectedWard(null);
    loadMunicipalities(districtId);
    setStep(3);
  };

  const handleMunicipalitySelect = (municipalityId: number) => {
    setSelectedMunicipality(municipalityId);
    setSelectedWard(null);
    loadWards(municipalityId);
    setStep(4);
  };

  const handleWardSelect = (wardNumber: number) => {
    setSelectedWard(wardNumber);
    // Here you would make the API call to get nearby offices
    console.log('Finding offices near:', {
      province: selectedProvince,
      district: selectedDistrict,
      municipality: selectedMunicipality,
      ward: selectedWard,
      officeType
    });
  };

  // Load provinces on mount
  useState(() => {
    loadProvinces();
  });

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white p-6 flex items-center justify-between">
          <div>
            <h3 className="text-2xl font-bold font-mw">Find Nearby Offices</h3>
            <p className="text-blue-100 text-sm mt-1">Select your location to find offices near you</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="bg-gray-50 px-6 py-4 border-b">
          <div className="flex items-center justify-between max-w-md mx-auto">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  step >= s ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-600'
                }`}>
                  {s}
                </div>
                {s < 4 && (
                  <div className={`w-12 h-1 mx-1 ${step > s ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                )}
              </div>
            ))}
          </div>
          <div className="text-center mt-2 text-sm text-gray-600">
            {step === 1 && 'Select Province'}
            {step === 2 && 'Select District'}
            {step === 3 && 'Select Municipality'}
            {step === 4 && 'Select Ward'}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-600 mt-4">Loading...</p>
            </div>
          ) : (
            <>
              {step === 1 && (
                <div className="grid grid-cols-1 gap-3">
                  {provinces.map((province) => (
                    <button
                      key={province.id}
                      onClick={() => handleProvinceSelect(province.id)}
                      className="text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                      <div className="font-semibold text-gray-900">{province.name}</div>
                      {province.nameNepali&& (
                        <div className="text-sm text-gray-600">{province.nameNepali}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {step === 2 && (
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => setStep(1)}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-2 text-left"
                  >
                    ← Change Province
                  </button>
                  {districts.map((district) => (
                    <button
                      key={district.id}
                      onClick={() => handleDistrictSelect(district.id)}
                      className="text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                      <div className="font-semibold text-gray-900">{district.name}</div>
                      {district.nameNepali && (
                        <div className="text-sm text-gray-600">{district.nameNepali}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {step === 3 && (
                <div className="grid grid-cols-1 gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="text-blue-600 hover:text-blue-700 font-medium text-sm mb-2 text-left"
                  >
                    ← Change District
                  </button>
                  {municipalities.map((municipality) => (
                    <button
                      key={municipality.id}
                      onClick={() => handleMunicipalitySelect(municipality.id)}
                      className="text-left p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                      <div className="font-semibold text-gray-900">
                        {municipality.name}
                        <span className="ml-2 text-xs bg-gray-200 px-2 py-1 rounded">
                          {municipality.type}
                        </span>
                      </div>
                      {municipality.nameNepali && (
                        <div className="text-sm text-gray-600">{municipality.nameNepali}</div>
                      )}
                    </button>
                  ))}
                </div>
              )}

              {step === 4 && (
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setStep(3)}
                    className="col-span-2 text-blue-600 hover:text-blue-700 font-medium text-sm mb-2 text-left"
                  >
                    ← Change Municipality
                  </button>
                  {wards.map((ward) => (
                    <button
                      key={ward.id}
                      onClick={() => handleWardSelect(ward.wardNumber)}
                      className="text-center p-4 rounded-lg border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 transition-all"
                    >
                      <div className="font-semibold text-gray-900">Ward {ward.wardNumber}</div>
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
