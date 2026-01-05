// ============================================
// FILE: components/services/OfficeFinderCard.tsx
// DESCRIPTION: Inline office finder for service steps - uses stored user locations
// ============================================

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OfficeCategoryBadge } from "@/components/shared";
import { getOfficesForService, type UpdateUserLocationsDto } from "@/lib/api";
import type { Office, OfficeCategory } from "@/lib/types";
import {
  Building2,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  AlertCircle,
  Loader2,
  Home,
} from "lucide-react";

interface OfficeFinderCardProps {
  serviceSlug: string;
  stepNumber: number;
  officeCategoryIds: string[]; // Category IDs for this step
  officeCategories?: OfficeCategory[]; // Category details for display
  addressType?: "permanent" | "convenient"; // Which address to use
  userLocations?: UpdateUserLocationsDto | null;
  className?: string;
}

export function OfficeFinderCard({
  serviceSlug,
  stepNumber,
  officeCategoryIds,
  officeCategories = [],
  addressType = "convenient", // Default to convenient address
  userLocations,
  className = "",
}: OfficeFinderCardProps) {

  const [offices, setOffices] = useState<Office[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get category name for display - use provided categories or fallback to ID
  const getCategoryDisplayName = (categoryId: string) => {
    const cat = officeCategories.find(c => c.id === categoryId);
    if (cat?.name) {
      // Convert type names like "WARD_OFFICE" to readable "Ward Office"
      return cat.name.split('_').map(word => 
        word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
      ).join(' ');
    }
    return categoryId;
  };

  // Fetch offices when component mounts or locations change
  useEffect(() => {
    const fetchOffices = async () => {
      console.log("[OfficeFinderCard] Starting fetchOffices...");
      console.log("[OfficeFinderCard] serviceSlug:", serviceSlug);
      console.log("[OfficeFinderCard] stepNumber:", stepNumber);
      console.log("[OfficeFinderCard] officeCategoryIds:", officeCategoryIds);
      console.log("[OfficeFinderCard] addressType:", addressType);
      console.log("[OfficeFinderCard] userLocations:", userLocations);

      if (!userLocations) {
        console.log("[OfficeFinderCard] No user locations provided, skipping fetch");
        setOffices([]);
        return;
      }

      // Determine which location to use based on addressType
      const districtId =
        addressType === "permanent"
          ? userLocations.permanentDistrictId
          : userLocations.convenientDistrictId;
      const municipalityId =
        addressType === "permanent"
          ? userLocations.permanentMunicipalityId
          : userLocations.convenientMunicipalityId;
      const wardId =
        addressType === "permanent"
          ? userLocations.permanentWardId
          : userLocations.convenientWardId;

      console.log("[OfficeFinderCard] Selected location IDs:", {
        districtId,
        municipalityId,
        wardId,
      });

      // Need at least district
      if (!districtId) {
        console.log("[OfficeFinderCard] No district ID available, skipping fetch");
        setOffices([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log("[OfficeFinderCard] Setting loading state to true");

        // Construct the API URL for logging
        const apiUrl = `/api/services/${serviceSlug}/offices`;
        console.log("[OfficeFinderCard] Fetching from URL:", apiUrl);
        console.log("[OfficeFinderCard] Query params:", {
          districtId,
          municipalityId,
          wardId,
        });

        const result = await getOfficesForService(serviceSlug, {
          districtId,
          municipalityId,
          wardId,
        });

        console.log("[OfficeFinderCard] ✅ API Response received");
        console.log("[OfficeFinderCard] Full API response:", JSON.stringify(result, null, 2));
        console.log("[OfficeFinderCard] Response type:", typeof result);
        console.log("[OfficeFinderCard] Response is array:", Array.isArray(result));
        console.log("[OfficeFinderCard] Response length:", result?.length);

        // Filter for current step - with fallback
        const stepOffices = Array.isArray(result) 
          ? result.find((r) => r.stepNumber === stepNumber)
          : null;
        
        console.log("[OfficeFinderCard] Step offices data:", stepOffices);
        console.log("[OfficeFinderCard] Step offices has officeCategoryIds:", stepOffices?.officeCategoryIds);
        console.log("[OfficeFinderCard] Step offices has officeCategories:", stepOffices?.offices[0].category);
        console.log("[OfficeFinderCard] Step isOnline:", stepOffices?.isOnline);
        
        // If step is online, don't show offices
        if (stepOffices?.isOnline) {
          console.log("[OfficeFinderCard] Step is online, not showing offices");
          setOffices([]);
          return;
        }
        
        // Use fallback to ensure we always have an array
        const officesList = stepOffices?.offices || [];
        console.log("[OfficeFinderCard] Setting offices state with:", officesList.length, "offices");
        console.log("[OfficeFinderCard] Offices list:", JSON.stringify(officesList, null, 2));
        
        setOffices(officesList);
        
        console.log("[OfficeFinderCard] State updated successfully");
      } catch (err) {
        console.error("[OfficeFinderCard] ❌ Error fetching offices:", err);
        console.error("[OfficeFinderCard] Error type:", err instanceof Error ? err.constructor.name : typeof err);
        console.error("[OfficeFinderCard] Error message:", err instanceof Error ? err.message : String(err));
        console.error("[OfficeFinderCard] Error stack:", err instanceof Error ? err.stack : "N/A");
        
        setError("Failed to load offices. Please try again.");
        setOffices([]);
      } finally {
        setLoading(false);
        console.log("[OfficeFinderCard] Setting loading state to false");
        console.log("[OfficeFinderCard] Final offices state:", offices.length, "offices");
      }
    };

    fetchOffices();
  }, [serviceSlug, stepNumber, addressType, userLocations]);

  const hasLocation = userLocations && (
    addressType === "permanent"
      ? userLocations.permanentDistrictId
      : userLocations.convenientDistrictId
  );

  return (
    <Card className={`mt-6 border-2 border-primary-blue/20 ${className}`}>
      <div className="p-4 bg-blue-50 border-b border-blue-100">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary-blue flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-semibold text-foreground">
                Nearby Offices
              </h4>
              {addressType === "permanent" && (
                <div className="flex items-center gap-1 text-xs text-blue-600 bg-blue-100 px-2 py-0.5 rounded">
                  <Home className="w-3 h-3" />
                  Permanent Address
                </div>
              )}
            </div>
            <p className="text-sm text-foreground-secondary mb-3">
              {addressType === "permanent"
                ? "Showing offices near your permanent address"
                : "Showing offices near your convenient location"}
            </p>
            {/* Show badges for all office categories */}
            <div className="flex flex-wrap gap-2">
              {officeCategoryIds.map((categoryId) => (
                <OfficeCategoryBadge key={categoryId} name={getCategoryDisplayName(categoryId)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4">
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

        {/* No Location Set */}
        {!loading && !hasLocation && !error && (
          <div className="text-center py-8 bg-surface rounded-lg">
            <MapPin className="w-10 h-10 text-foreground-muted mx-auto mb-2" />
            <p className="text-sm text-foreground-secondary mb-1">
              No {addressType} address set
            </p>
            <p className="text-xs text-foreground-muted">
              Please set your locations to view nearby offices
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
                  No offices found near your {addressType} address
                </p>
                <p className="text-xs text-foreground-muted">
                  Try updating your locations or contact support
                </p>
              </div>
            ) : (
              <>
                {/* Results Count */}
                <div className="flex items-center justify-between pb-2 border-b border-border mb-3">
                  <p className="text-sm font-medium text-foreground">
                    {offices.length} {offices.length === 1 ? "office" : "offices"} near you
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

                        {office.mapUrl && (
                          <a
                            href={office.mapUrl.includes('embed') ? office.mapUrl.replace('/embed', '/place') : office.mapUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-primary-blue hover:underline"
                          >
                            <ExternalLink className="w-4 h-4 shrink-0" />
                            <span>View on Map</span>
                          </a>
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
