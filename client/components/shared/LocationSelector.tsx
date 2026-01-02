// ============================================
// FILE: components/shared/LocationSelector.tsx
// DESCRIPTION: 4-level cascading location dropdown
// ============================================

"use client";

import { useState, useEffect, useCallback } from "react";
import { MapPin, ChevronRight, RotateCcw, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  getProvinces,
  getDistrictsByProvince,
  getMunicipalitiesByDistrict,
  getWardsByMunicipality,
} from "@/lib/api";
import type { Province, District, Municipality, Ward } from "@/lib/types";

export interface LocationValue {
  provinceId?: number;
  districtId?: number;
  municipalityId?: number;
  wardId?: number;
  province?: Province;
  district?: District;
  municipality?: Municipality;
  ward?: Ward;
}

interface LocationSelectorProps {
  value?: LocationValue;
  onChange?: (location: LocationValue) => void;
  showLabels?: boolean;
  showReset?: boolean;
  compact?: boolean;
  className?: string;
  required?: "province" | "district" | "municipality" | "ward";
}

export function LocationSelector({
  value = {},
  onChange,
  showLabels = true,
  showReset = true,
  compact = false,
  className,
  required,
}: LocationSelectorProps) {
  // Data states
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [municipalities, setMunicipalities] = useState<Municipality[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);

  // Loading states
  const [loadingProvinces, setLoadingProvinces] = useState(true);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingMunicipalities, setLoadingMunicipalities] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);

  // Error state
  const [error, setError] = useState<string | null>(null);

  // Load provinces on mount
  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        setLoadingProvinces(true);
        const data = await getProvinces();
        setProvinces(data);
      } catch (err) {
        setError("Failed to load provinces");
        console.error(err);
      } finally {
        setLoadingProvinces(false);
      }
    };
    fetchProvinces();
  }, []);

  // Load districts when province changes
  useEffect(() => {
    if (value.provinceId) {
      const fetchDistricts = async () => {
        try {
          setLoadingDistricts(true);
          const data = await getDistrictsByProvince(value.provinceId!);
          setDistricts(data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingDistricts(false);
        }
      };
      fetchDistricts();
    } else {
      setDistricts([]);
    }
  }, [value.provinceId]);

  // Load municipalities when district changes
  useEffect(() => {
    if (value.districtId) {
      const fetchMunicipalities = async () => {
        try {
          setLoadingMunicipalities(true);
          const data = await getMunicipalitiesByDistrict(value.districtId!);
          setMunicipalities(data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingMunicipalities(false);
        }
      };
      fetchMunicipalities();
    } else {
      setMunicipalities([]);
    }
  }, [value.districtId]);

  // Load wards when municipality changes
  useEffect(() => {
    if (value.municipalityId) {
      const fetchWards = async () => {
        try {
          setLoadingWards(true);
          const data = await getWardsByMunicipality(value.municipalityId!);
          setWards(data);
        } catch (err) {
          console.error(err);
        } finally {
          setLoadingWards(false);
        }
      };
      fetchWards();
    } else {
      setWards([]);
    }
  }, [value.municipalityId]);

  // Handle province change
  const handleProvinceChange = useCallback(
    (provinceId: string) => {
      const province = provinces.find((p) => p.id === parseInt(provinceId));
      onChange?.({
        provinceId: parseInt(provinceId),
        province,
        districtId: undefined,
        municipalityId: undefined,
        wardId: undefined,
      });
    },
    [provinces, onChange]
  );

  // Handle district change
  const handleDistrictChange = useCallback(
    (districtId: string) => {
      const district = districts.find((d) => d.id === parseInt(districtId));
      onChange?.({
        ...value,
        districtId: parseInt(districtId),
        district,
        municipalityId: undefined,
        wardId: undefined,
      });
    },
    [districts, value, onChange]
  );

  // Handle municipality change
  const handleMunicipalityChange = useCallback(
    (municipalityId: string) => {
      const municipality = municipalities.find(
        (m) => m.id === parseInt(municipalityId)
      );
      onChange?.({
        ...value,
        municipalityId: parseInt(municipalityId),
        municipality,
        wardId: undefined,
      });
    },
    [municipalities, value, onChange]
  );

  // Handle ward change
  const handleWardChange = useCallback(
    (wardId: string) => {
      const ward = wards.find((w) => w.id === parseInt(wardId));
      onChange?.({
        ...value,
        wardId: parseInt(wardId),
        ward,
      });
    },
    [wards, value, onChange]
  );

  // Reset selection
  const handleReset = useCallback(() => {
    onChange?.({});
  }, [onChange]);

  const isComplete =
    value.provinceId &&
    value.districtId &&
    value.municipalityId &&
    value.wardId;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-foreground">
          <MapPin className="w-4 h-4 text-nepal-crimson" />
          <span className="font-medium text-sm">Select Your Location</span>
        </div>
        {showReset && (value.provinceId || value.districtId) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="text-xs text-foreground-muted hover:text-foreground"
          >
            <RotateCcw className="w-3 h-3 mr-1" />
            Reset
          </Button>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="text-sm text-error bg-error-bg px-3 py-2 rounded-lg">
          {error}
        </div>
      )}

      {/* Dropdowns */}
      <div
        className={cn(
          "grid gap-3",
          compact ? "grid-cols-2 lg:grid-cols-4" : "grid-cols-1 sm:grid-cols-2"
        )}
      >
        {/* Province */}
        <div className="space-y-1.5">
          {showLabels && (
            <label className="text-xs font-medium text-foreground-secondary">
              Province
              {required === "province" && (
                <span className="text-nepal-crimson ml-0.5">*</span>
              )}
            </label>
          )}
          <Select
            value={value.provinceId?.toString()}
            onValueChange={handleProvinceChange}
            disabled={loadingProvinces}
          >
            <SelectTrigger className={cn(loadingProvinces && "opacity-70")}>
              {loadingProvinces ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                <SelectValue placeholder="Select Province" />
              )}
            </SelectTrigger>
            <SelectContent>
              {provinces.map((province) => (
                <SelectItem key={province.id} value={province.id.toString()}>
                  {province.name}
                  {province.nameNepali && (
                    <span className="text-foreground-muted ml-1 text-xs">
                      ({province.nameNepali})
                    </span>
                  )}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* District */}
        <div className="space-y-1.5">
          {showLabels && (
            <label className="text-xs font-medium text-foreground-secondary">
              District
              {required === "district" && (
                <span className="text-nepal-crimson ml-0.5">*</span>
              )}
            </label>
          )}
          <Select
            value={value.districtId?.toString()}
            onValueChange={handleDistrictChange}
            disabled={!value.provinceId || loadingDistricts}
          >
            <SelectTrigger
              className={cn(
                (!value.provinceId || loadingDistricts) && "opacity-70"
              )}
            >
              {loadingDistricts ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                <SelectValue
                  placeholder={
                    value.provinceId ? "Select District" : "Select Province first"
                  }
                />
              )}
            </SelectTrigger>
            <SelectContent>
              {districts.map((district) => (
                <SelectItem key={district.id} value={district.id.toString()}>
                  {district.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Municipality */}
        <div className="space-y-1.5">
          {showLabels && (
            <label className="text-xs font-medium text-foreground-secondary">
              Municipality
              {required === "municipality" && (
                <span className="text-nepal-crimson ml-0.5">*</span>
              )}
            </label>
          )}
          <Select
            value={value.municipalityId?.toString()}
            onValueChange={handleMunicipalityChange}
            disabled={!value.districtId || loadingMunicipalities}
          >
            <SelectTrigger
              className={cn(
                (!value.districtId || loadingMunicipalities) && "opacity-70"
              )}
            >
              {loadingMunicipalities ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                <SelectValue
                  placeholder={
                    value.districtId
                      ? "Select Municipality"
                      : "Select District first"
                  }
                />
              )}
            </SelectTrigger>
            <SelectContent>
              {municipalities.map((municipality) => (
                <SelectItem
                  key={municipality.id}
                  value={municipality.id.toString()}
                >
                  {municipality.name}
                  <span className="text-foreground-muted ml-1 text-xs">
                    ({municipality.type.replace("_", " ")})
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ward */}
        <div className="space-y-1.5">
          {showLabels && (
            <label className="text-xs font-medium text-foreground-secondary">
              Ward
              {required === "ward" && (
                <span className="text-nepal-crimson ml-0.5">*</span>
              )}
            </label>
          )}
          <Select
            value={value.wardId?.toString()}
            onValueChange={handleWardChange}
            disabled={!value.municipalityId || loadingWards}
          >
            <SelectTrigger
              className={cn(
                (!value.municipalityId || loadingWards) && "opacity-70"
              )}
            >
              {loadingWards ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Loading...</span>
                </div>
              ) : (
                <SelectValue
                  placeholder={
                    value.municipalityId
                      ? "Select Ward"
                      : "Select Municipality first"
                  }
                />
              )}
            </SelectTrigger>
            <SelectContent>
              {wards.map((ward) => (
                <SelectItem key={ward.id} value={ward.id.toString()}>
                  Ward {ward.wardNumber}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Selected Location Summary */}
      {isComplete && (
        <div className="flex items-center gap-1.5 text-sm text-success bg-success-bg px-3 py-2 rounded-lg">
          <MapPin className="w-4 h-4" />
          <span>
            {value.province?.name}, {value.district?.name},{" "}
            {value.municipality?.name}, Ward {value.ward?.wardNumber}
          </span>
        </div>
      )}
    </div>
  );
}

export default LocationSelector;
