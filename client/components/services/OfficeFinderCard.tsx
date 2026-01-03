// ============================================
// FILE: components/services/OfficeFinderCard.tsx
// DESCRIPTION: Inline office finder for service steps
// ============================================

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LocationSelector } from "@/components/shared";
import type { LocationValue } from "@/components/shared/LocationSelector";
import { OfficeTypeBadge } from "@/components/shared";
import { getOfficesForService } from "@/lib/api";
import type { Office, OfficeType } from "@/lib/types";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface OfficeFinderCardProps {
  serviceSlug: string;
  stepNumber: number;
  officeType: OfficeType;
  className?: string;
}

export function OfficeFinderCard({
  serviceSlug,
  stepNumber,
  officeType,
  className = "",
}: OfficeFinderCardProps) {
  const [location, setLocation] = useState<LocationValue>({});
  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch offices when location changes
  useEffect(() => {
    const fetchOffices = async () => {
      // Only fetch if we have at least a district
      if (!location.districtId) {
        setOffices([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await getOfficesForService(serviceSlug, {
          districtId: location.districtId,
          municipalityId: location.municipalityId,
          wardId: location.wardId,
        });

        // Filter for current step
        const stepOffices = result.find((r) => r.stepNumber === stepNumber);
        setOffices(stepOffices?.offices || []);
      } catch (err) {
        console.error("Failed to fetch offices:", err);
        setError("Failed to load offices. Please try again.");
        setOffices([]);
      } finally {
        setLoading(false);
      }
    };

    fetchOffices();
  }, [serviceSlug, stepNumber, location.districtId, location.municipalityId, location.wardId]);

  const hasLocation = location.districtId !== undefined;

  return (
    <Card className={`mt-6 border-2 border-primary-blue/20 ${className}`}>
      <div className="p-4 bg-blue-50 border-b border-blue-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-blue flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-foreground mb-1">
              Find Nearby Offices
            </h4>
            <p className="text-sm text-foreground-secondary mb-3">
              Select your location to find offices where you can complete this step
            </p>
            <OfficeTypeBadge type={officeType} />
          </div>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* Location Selector */}
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">
            Select Your Location
          </label>
          <LocationSelector
            value={location}
            onChange={setLocation}
            showLabels={false}
            showReset={true}
            required="district"
          />
          {!hasLocation && (
            <p className="text-xs text-foreground-muted mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              Please select at least a district to find offices
            </p>
          )}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary-blue mr-2" />
            <span className="text-sm text-foreground-secondary">
              Finding offices...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          </div>
        )}

        {/* No Location Selected */}
        {!loading && !hasLocation && !error && (
          <div className="text-center py-8 bg-surface rounded-lg">
            <MapPin className="w-10 h-10 text-foreground-muted mx-auto mb-2" />
            <p className="text-sm text-foreground-secondary">
              Select a location above to find offices
            </p>
          </div>
        )}

        {/* Office Results */}
        {!loading && hasLocation && !error && (
          <>
            {offices.length === 0 ? (
              <div className="text-center py-8 bg-surface rounded-lg">
                <Building2 className="w-10 h-10 text-foreground-muted mx-auto mb-2" />
                <p className="text-sm text-foreground-secondary mb-1">
                  No offices found in the selected location
                </p>
                <p className="text-xs text-foreground-muted">
                  Try selecting a different area or district
                </p>
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <p className="text-sm font-medium text-foreground">
                    Found {offices.length} {offices.length === 1 ? "office" : "offices"}
                  </p>
                </div>

                {/* Office List */}
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {offices.map((office) => (
                    <div
                      key={office.id}
                      className="p-4 bg-surface rounded-lg border border-border hover:border-primary-blue/50 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex-1">
                          <h5 className="font-semibold text-foreground mb-1">
                            {office.name}
                          </h5>
                          {office.nameNepali && (
                            <p className="text-sm text-foreground-muted nepali-text">
                              {office.nameNepali}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Office Details */}
                      <div className="space-y-2 text-sm">
                        {office.address && (
                          <div className="flex items-start gap-2 text-foreground-secondary">
                            <MapPin className="w-4 h-4 shrink-0 mt-0.5 text-foreground-muted" />
                            <span>{office.address}</span>
                          </div>
                        )}

                        {office.contact && (
                          <div className="flex items-center gap-2 text-foreground-secondary">
                            <Phone className="w-4 h-4 shrink-0 text-foreground-muted" />
                            <a
                              href={`tel:${office.contact}`}
                              className="hover:text-primary-blue"
                            >
                              {office.contact}
                            </a>
                          </div>
                        )}

                        {office.email && (
                          <div className="flex items-center gap-2 text-foreground-secondary">
                            <Mail className="w-4 h-4 shrink-0 text-foreground-muted" />
                            <a
                              href={`mailto:${office.email}`}
                              className="hover:text-primary-blue"
                            >
                              {office.email}
                            </a>
                          </div>
                        )}
                      </div>

                      {/* View Details Button */}
                      <Button
                        asChild
                        variant="outline"
                        size="sm"
                        className="w-full mt-3"
                      >
                        <Link href={`/offices/${office.id}`}>
                          View Full Details
                          <ExternalLink className="w-3 h-3 ml-2" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </Card>
  );
}

export default OfficeFinderCard;
