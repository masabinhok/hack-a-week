// ============================================
// FILE: app/services/[slug]/guide/GuideClient.tsx
// DESCRIPTION: Client component for service guide with location management
// ============================================

"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BreadcrumbTrail, PriorityBadge } from "@/components/shared";
import { StepTimeline, ServiceSidebar, LocationSetupModal } from "@/components/services";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ServiceWithGuide } from "@/lib/types";
import type { UpdateUserLocationsDto } from "@/lib/api";
import {
  Globe,
  Share2,
  Printer,
  Bookmark,
  ArrowLeft,
  FileText,
  Clock,
  AlertCircle,
  MapPin,
} from "lucide-react";

interface GuideClientProps {
  service: ServiceWithGuide;
  slug: string;
  breadcrumbs: Array<{ label: string; href: string }>;
}

export function GuideClient({ service, slug, breadcrumbs }: GuideClientProps) {
  const [userLocations, setUserLocations] = useState<UpdateUserLocationsDto | null>(null);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [locationChecked, setLocationChecked] = useState(false);

  // Check for stored locations on mount
  useEffect(() => {
    const stored = localStorage.getItem("userLocations");
    if (stored) {
      try {
        const locations = JSON.parse(stored);
        setUserLocations(locations);
      } catch (err) {
        console.error("Failed to parse stored locations:", err);
      }
    }
    setLocationChecked(true);

    // Show modal if no locations are set
    if (!stored) {
      setShowLocationModal(true);
    }
  }, []);

  const handleLocationComplete = (locations: UpdateUserLocationsDto) => {
    setUserLocations(locations);
    setShowLocationModal(false);
  };

  const handleLocationUpdate = () => {
    setShowLocationModal(true);
  };

  // Calculate total estimated time if available
  const totalMinTime = service.steps?.reduce((acc, step) => {
    if (step.timeRequired?.minimumTime) {
      const match = step.timeRequired.minimumTime.match(/(\d+)/);
      return acc + (match ? parseInt(match[1]) : 0);
    }
    return acc;
  }, 0);

  const totalMaxTime = service.steps?.reduce((acc, step) => {
    if (step.timeRequired?.maximumTime) {
      const match = step.timeRequired.maximumTime.match(/(\d+)/);
      return acc + (match ? parseInt(match[1]) : 0);
    }
    return acc;
  }, 0);

  // Calculate total fees
  const totalFees = service.steps?.reduce((acc, step) => {
    const stepTotal = step.totalFees?.reduce((sum, fee) => sum + fee.feeAmount, 0) || 0;
    return acc + stepTotal;
  }, 0);

  const hasLocations =
    userLocations &&
    (userLocations.permanentDistrictId || userLocations.convenientDistrictId);

  return (
    <>
      {/* Location Setup Modal */}
      {showLocationModal && locationChecked && (
        <LocationSetupModal
          userId="temp-user" // TODO: Replace with actual user ID from auth
          onComplete={handleLocationComplete}
          onSkip={() => setShowLocationModal(false)}
          initialPermanent={{}}
          initialConvenient={{}}
        />
      )}

      <main className="flex-1 py-8 md:py-12">
        <div className="container-custom">
          {/* Breadcrumb */}
          <BreadcrumbTrail items={breadcrumbs} className="mb-6" />

          {/* Back Button */}
          <Button asChild variant="ghost" size="sm" className="mb-6">
            <Link href={`/services/${slug}`}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Service Overview
            </Link>
          </Button>

          {/* Location Status Banner */}
          {!hasLocations && locationChecked && (
            <div className="mb-6 p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-yellow-600 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <p className="font-medium text-yellow-900 mb-1">
                    Set Your Locations to View Nearby Offices
                  </p>
                  <p className="text-sm text-yellow-700 mb-3">
                    Configure your permanent and convenient addresses once to automatically
                    see relevant offices for each step.
                  </p>
                  <Button
                    size="sm"
                    onClick={handleLocationUpdate}
                    className="bg-yellow-600 hover:bg-yellow-700"
                  >
                    Set Locations Now
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Service Header */}
          <div className="mb-8 pb-8 border-b border-border">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                    {service.name}
                  </h1>
                  {service.priority && <PriorityBadge priority={service.priority} />}
                  {service.isOnlineEnabled && (
                    <Badge className="bg-green-100 text-green-700 border-green-200">
                      <Globe className="w-3 h-3 mr-1" />
                      Online Available
                    </Badge>
                  )}
                  {hasLocations && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleLocationUpdate}
                      className="ml-auto"
                    >
                      <MapPin className="w-4 h-4 mr-2" />
                      Update Locations
                    </Button>
                  )}
                </div>
                {service.nameNepali && (
                  <p className="text-lg text-foreground-muted nepali-text mb-4">
                    {service.nameNepali}
                  </p>
                )}
                {service.description && (
                  <p className="text-foreground-secondary max-w-3xl">
                    {service.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Share2 className="w-4 h-4 mr-2" />
                  Share
                </Button>
                <Button variant="outline" size="sm">
                  <Printer className="w-4 h-4 mr-2" />
                  Print
                </Button>
                <Button variant="outline" size="sm">
                  <Bookmark className="w-4 h-4 mr-2" />
                  Save
                </Button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="flex flex-wrap gap-6 mt-6">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                  <FileText className="w-5 h-5 text-primary-blue" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">
                    {service.steps?.length || 0} Steps
                  </p>
                  <p className="text-xs text-foreground-secondary">
                    Complete process
                  </p>
                </div>
              </div>

              {(totalMinTime || totalMaxTime) && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-10 h-10 rounded-lg bg-purple-50 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      {totalMinTime && totalMaxTime
                        ? `${totalMinTime}-${totalMaxTime} days`
                        : totalMinTime
                        ? `${totalMinTime}+ days`
                        : `${totalMaxTime} days`}
                    </p>
                    <p className="text-xs text-foreground-secondary">
                      Estimated time
                    </p>
                  </div>
                </div>
              )}

              {totalFees > 0 && (
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <FileText className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">
                      NPR {totalFees.toLocaleString()}
                    </p>
                    <p className="text-xs text-foreground-secondary">Total fees</p>
                  </div>
                </div>
              )}
            </div>

            {/* Online Portal Link */}
            {service.isOnlineEnabled && service.onlinePortalUrl && (
              <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Globe className="w-5 h-5 text-green-600 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-medium text-green-900 mb-1">Apply Online</p>
                    <p className="text-sm text-green-700 mb-3">
                      This service is available online. You can apply through the
                      official portal.
                    </p>
                    <Button
                      asChild
                      size="sm"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <a
                        href={service.onlinePortalUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        Visit Online Portal
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {/* Eligibility */}
            {service.eligibility && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 mb-1">Eligibility</p>
                    <p className="text-sm text-blue-700">{service.eligibility}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Validity Period */}
            {service.validityPeriod && (
              <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-900 mb-1">
                      Validity Period
                    </p>
                    <p className="text-sm text-yellow-700">
                      {service.validityPeriod}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Step Timeline */}
            <div className="lg:col-span-2">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Step-by-Step Process
              </h2>

              {service.steps && service.steps.length > 0 ? (
                <StepTimeline
                  steps={service.steps}
                  serviceSlug={slug}
                  userLocations={userLocations}
                />
              ) : (
                <div className="text-center py-12 bg-surface rounded-2xl">
                  <AlertCircle className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
                  <p className="text-foreground-secondary">
                    No detailed steps information available for this service yet.
                  </p>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <ServiceSidebar service={service} className="sticky top-24" />
            </div>
          </div>

          {/* Detailed Procedure */}
          {service.detailedProcedure && (
            <section className="mt-12 pt-8 border-t border-border">
              <h2 className="text-xl font-bold text-foreground mb-6">
                Detailed Procedure
              </h2>
              <div className="prose max-w-none">
                <div
                  className="bg-surface p-6 rounded-lg"
                  dangerouslySetInnerHTML={{ __html: service.detailedProcedure }}
                />
              </div>
            </section>
          )}

          {/* Metadata */}
          {service.metadata && (
            <section className="mt-8 p-4 bg-surface rounded-lg border border-border">
              <p className="text-xs text-foreground-muted">
                Last Updated:{" "}
                {new Date(service.metadata.lastUpdated).toLocaleDateString()}
                {service.metadata.dataSource &&
                  ` • Source: ${service.metadata.dataSource}`}
                {service.metadata.verifiedBy &&
                  ` • Verified by: ${service.metadata.verifiedBy}`}
              </p>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
