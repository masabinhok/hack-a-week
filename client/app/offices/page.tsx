// ============================================
// FILE: app/offices/page.tsx
// DESCRIPTION: Office finder page with location filters
// ============================================

import type { Metadata } from "next";
import Link from "next/link";
import { getOffices, getProvinces } from "@/lib/api";
import { BreadcrumbTrail, LocationSelector, OfficeTypeBadge } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  MapPin,
  Phone,
  Mail,
  Clock,
  Building2,
  Filter,
  ChevronRight,
  ExternalLink,
} from "lucide-react";
import { OFFICE_TYPES } from "@/lib/constants";

export const metadata: Metadata = {
  title: "Find Government Offices",
  description:
    "Find government offices in Nepal by location. Get addresses, contact information, working hours, and directions for ward offices, district offices, and more.",
};

export default async function OfficesPage() {
  let offices: Awaited<ReturnType<typeof getOffices>> = [];
  let provinces: Awaited<ReturnType<typeof getProvinces>> = [];

  try {
    [offices, provinces] = await Promise.all([
      getOffices(),
      getProvinces(),
    ]);
  } catch {
    // Handle errors
  }

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Find Offices", href: "/offices" },
  ];

  // Group offices by type
  const officesByType = offices.reduce((acc, office) => {
    const type = office.category?.slug || "other";
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(office);
    return acc;
  }, {} as Record<string, typeof offices>);

  return (
    <main className="flex-1 py-8 md:py-12">
      <div className="container-custom">
        {/* Breadcrumb */}
        <BreadcrumbTrail items={breadcrumbs} className="mb-6" />

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Find Government Offices
          </h1>
          <p className="text-lg text-foreground-secondary max-w-2xl">
            Locate government offices near you. Filter by location to find ward
            offices, district administration offices, and other government
            buildings.
          </p>
        </div>

        {/* Filters Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Filter className="w-5 h-5 text-primary-blue" />
              <h2 className="font-semibold text-foreground">
                Filter Offices
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Location Selector */}
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Select Location
                </label>
                <LocationSelector provinces={provinces} />
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
                  />
                </div>
              </div>
            </div>

            {/* Office Type Filters */}
            <div className="mt-6">
              <label className="text-sm font-medium text-foreground mb-2 block">
                Office Type
              </label>
              <div className="flex flex-wrap gap-2">
                <Badge
                  variant="secondary"
                  className="cursor-pointer hover:bg-nepal-crimson-100"
                >
                  All Types
                </Badge>
                {Object.entries(OFFICE_TYPES).map(([key, type]) => (
                  <Badge
                    key={key}
                    variant="outline"
                    className="cursor-pointer hover:bg-surface-hover"
                  >
                    {type.label}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results Count */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-foreground-secondary">
            Found <span className="font-semibold">{offices.length}</span> offices
          </p>
        </div>

        {/* Offices Grid */}
        {offices.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {offices.map((office, index) => (
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
                        <OfficeTypeBadge type={office.category.slug} />
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
                    {office.location && (
                      <p className="text-sm text-foreground-secondary flex items-start gap-2 mb-3">
                        <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                        <span>
                          {office.location.municipality?.name},{" "}
                          {office.location.district?.name}
                          {office.location.ward && ` - Ward ${office.location.ward.number}`}
                        </span>
                      </p>
                    )}

                    {/* Contact Info */}
                    <div className="space-y-2 mt-4 pt-4 border-t border-border">
                      {office.phone && (
                        <p className="text-xs text-foreground-secondary flex items-center gap-2">
                          <Phone className="w-3 h-3" />
                          {office.phone}
                        </p>
                      )}
                      {office.email && (
                        <p className="text-xs text-foreground-secondary flex items-center gap-2">
                          <Mail className="w-3 h-3" />
                          {office.email}
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
        ) : (
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
      </div>
    </main>
  );
}
