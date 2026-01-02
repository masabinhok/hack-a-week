// ============================================
// FILE: app/offices/OfficesClient.tsx
// DESCRIPTION: Client component for offices page with filtering
// ============================================

"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { getOffices, OfficeType } from "@/lib/api";
import { LocationSelector, OfficeTypeBadge } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import type { Office } from "@/lib/types";
import type { LocationValue } from "@/components/shared/LocationSelector";
import {
  Search,
  Phone,
  Mail,
  Building2,
  Filter,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { OFFICE_TYPES } from "@/lib/constants";

export function OfficesClient() {
  const [location, setLocation] = useState<LocationValue>({});
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");

  // Fetch offices when location changes
  useEffect(() => {
    const fetchOffices = async () => {
      // Only fetch if we have at least a province
      if (!location.provinceId) {
        setOffices([]);
        return;
      }

      try {
        setLoading(true);
        const filters: any = {};
        
        if (location.provinceId) filters.provinceId = location.provinceId;
        if (location.districtId) filters.districtId = location.districtId;
        if (location.municipalityId) filters.municipalityId = location.municipalityId;
        if (location.wardId) filters.wardId = location.wardId;

        const data = await getOffices(filters);
        setOffices(data);
      } catch (error) {
        console.error("Failed to fetch offices:", error);
        setOffices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffices();
  }, [location]);

  // Filter offices based on search and type
  const filteredOffices = useMemo(() => {
    let filtered = offices;

    // Filter by office type
    if (selectedType !== "all") {
      filtered = filtered.filter(
        (office) => office.category?.slug === selectedType
      );
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((office) => {
        const nameMatch = office.name.toLowerCase().includes(query);
        const nameNepaliMatch = office.nameNepali?.toLowerCase().includes(query);
        const locationMatch = office.jurisdiction?.municipality?.name
          ?.toLowerCase()
          .includes(query);
        return nameMatch || nameNepaliMatch || locationMatch;
      });
    }

    return filtered;
  }, [offices, selectedType, searchQuery]);

  // Get unique office types from current offices
  const availableTypes = useMemo(() => {
    const types = new Set(
      offices.map((office) => office.category?.slug).filter(Boolean)
    );
    return Array.from(types);
  }, [offices]);

  const hasFilters = location.provinceId !== undefined;

  return (
    <>
      {/* Filters Section */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-primary-blue" />
            <h2 className="font-semibold text-foreground">Filter Offices</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Location Selector */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Select Location
              </label>
              <LocationSelector
                value={location}
                onChange={setLocation}
                showLabels={false}
              />
            </div>

            {/* Search */}
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Search by Name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                <Input
                  type="text"
                  placeholder="Search office name..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  disabled={!hasFilters}
                />
              </div>
              {!hasFilters && (
                <p className="text-xs text-foreground-muted mt-1">
                  Select a location to enable search
                </p>
              )}
            </div>
          </div>

          {/* Office Type Filters */}
          {hasFilters && availableTypes.length > 0 && (
            <div className="mt-6">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Office Type
              </label>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={selectedType === "all" ? "default" : "secondary"}
                  className="cursor-pointer hover:bg-nepal-crimson-100"
                  onClick={() => setSelectedType("all")}
                >
                  All Types ({offices.length})
                </Badge>
                {availableTypes.map((type) => {
                  const count = offices.filter(
                    (o) => o.category?.slug === type
                  ).length;
                  const typeKey = type?.toUpperCase().replace(/-/g, '_') as keyof typeof OFFICE_TYPES;
                  const typeInfo = OFFICE_TYPES[typeKey];
                  return (
                    <Badge
                      key={type}
                      variant={selectedType === type ? "default" : "outline"}
                      className="cursor-pointer hover:bg-surface-hover"
                      onClick={() => setSelectedType(type as string)}
                    >
                      {typeInfo?.label || type} ({count})
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 animate-spin text-primary-crimson" />
          <span className="ml-3 text-foreground-secondary">
            Loading offices...
          </span>
        </div>
      )}

      {/* No Location Selected */}
      {!loading && !hasFilters && (
        <div className="text-center py-16 bg-surface rounded-2xl">
          <Building2 className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
          <p className="text-foreground-secondary mb-2">
            Select a location to view offices
          </p>
          <p className="text-sm text-foreground-muted">
            Use the filters above to find government offices in your area.
          </p>
        </div>
      )}

      {/* Results Count */}
      {!loading && hasFilters && (
        <div className="flex items-center justify-between mb-6">
          <p className="text-foreground-secondary">
            Found <span className="font-semibold">{filteredOffices.length}</span>{" "}
            {filteredOffices.length === 1 ? "office" : "offices"}
            {searchQuery && " matching your search"}
          </p>
        </div>
      )}

      {/* Offices Grid */}
      {!loading && hasFilters && filteredOffices.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffices.map((office, index) => (
            <Link
              key={office.id}
              href={`/offices/${office.id}`}
              className="group animate-fade-in opacity-0"
              style={{
                animationDelay: `${index * 30}ms`,
                animationFillMode: "forwards",
              }}
            >
              <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group-hover:border-primary-crimson">
                <CardContent className="p-5">
                  {/* Office Type Badge */}
                  <div className="mb-3">
                    {office.category && (
                      <OfficeTypeBadge
                        type={office.category.slug as OfficeType}
                      />
                    )}
                  </div>

                  {/* Office Name */}
                  <h3 className="font-semibold text-foreground group-hover:text-primary-crimson transition-colors mb-1">
                    {office.name}
                  </h3>
                  {office.nameNepali && (
                    <p className="text-sm text-foreground-muted nepali-text mb-3">
                      {office.nameNepali}
                    </p>
                  )}

                  {/* Location */}
                  {office.jurisdiction && (
                    <p className="text-sm text-foreground-secondary mb-3">
                      {office.jurisdiction.municipality?.name}
                      {office.jurisdiction.ward && ` - Ward ${office.jurisdiction.ward.wardNumber}`}
                      <br />
                      {office.jurisdiction.district?.name}
                    </p>
                  )}

                  {/* Contact Info */}
                  <div className="space-y-2 mt-4 pt-4 border-t border-border">
                    {office.contact && (
                      <p className="text-xs text-foreground-secondary flex items-center gap-2">
                        <Phone className="w-3 h-3" />
                        {office.contact}
                      </p>
                    )}
                    {office.email && (
                      <p className="text-xs text-foreground-secondary flex items-center gap-2 truncate">
                          <Mail className="w-3 h-3 shrink-0" />
                        <span className="truncate">{office.email}</span>
                      </p>
                    )}
                  </div>

                  {/* View Details Arrow */}
                  <div className="flex items-center justify-end mt-4 text-foreground-muted group-hover:text-primary-crimson">
                    <span className="text-xs mr-1">View Details</span>
                    <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && hasFilters && filteredOffices.length === 0 && offices.length > 0 && (
        <div className="text-center py-16 bg-surface rounded-2xl">
          <Building2 className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
          <p className="text-foreground-secondary mb-2">
            No offices found matching your criteria.
          </p>
          <p className="text-sm text-foreground-muted">
            Try adjusting your filters or search terms.
          </p>
        </div>
      )}

      {/* No Offices in Location */}
      {!loading && hasFilters && offices.length === 0 && (
        <div className="text-center py-16 bg-surface rounded-2xl">
          <Building2 className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
          <p className="text-foreground-secondary mb-2">
            No offices found in the selected location.
          </p>
          <p className="text-sm text-foreground-muted">
            Try selecting a different province or district.
          </p>
        </div>
      )}
    </>
  );
}
