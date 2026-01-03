// ============================================
// FILE: app/offices/[id]/page.tsx
// DESCRIPTION: Individual office detail page
// ============================================

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getOfficeById, OfficeType } from "@/lib/api";
import { BreadcrumbTrail, OfficeTypeBadge } from "@/components/shared";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  MapPin,
  Phone,
  Mail,
  Globe,
  Clock,
  Building2,
  ArrowLeft,
  ExternalLink,
  Navigation,
  Copy,
} from "lucide-react";
import { getGoogleMapsUrl } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  
  let office = null;
  try {
    office = await getOfficeById(id);
  } catch {
    // Office not found
  }

  if (!office) {
    return {
      title: "Office Not Found",
    };
  }

  return {
    title: office.name,
    description: `Contact information, location, and working hours for ${office.name}. Find address, phone number, and services offered.`,
  };
}

export default async function OfficeDetailPage({ params }: PageProps) {
  const { id } = await params;

  let office = null;
  try {
    office = await getOfficeById(id);
  } catch {
    // Handle error
  }

  if (!office) {
    notFound();
  }

  const breadcrumbs = [

    { label: "Find Offices", href: "/offices" },
    { label: office.name, href: `/offices/${id}` },
  ];

//   const locationParts = [
//     office.location?.ward && `Ward ${office.location.ward.number}`,
//     office.location?.municipality?.name,
//     office.location?.district?.name,
//     office.location?.province?.name,
//   ].filter(Boolean);

  const fullAddress = office.address;

  return (
    <main className="flex-1 py-8 md:py-12">
      <div className="container-custom">
        {/* Breadcrumb */}
        <BreadcrumbTrail items={breadcrumbs} className="mb-6" />

        {/* Back Button */}
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link href="/offices">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Offices
          </Link>
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Office Header */}
            <Card>
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 w-16 h-16 rounded-2xl bg-linear-to-br from-nepal-blue-100 to-nepal-blue-200 flex items-center justify-center text-primary-blue">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-1">
                          {office.name}
                        </h1>
                        {office.nameNepali && (
                          <p className="text-lg text-foreground-muted nepali-text mb-3">
                            {office.nameNepali}
                          </p>
                        )}
                        {office.category && (
                          <OfficeTypeBadge type={office.category.slug as OfficeType} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Location & Address */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary-crimson" />
                  Location & Address
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Full Address */}
                <div className="p-4 bg-surface rounded-lg">
                  <p className="text-foreground">{fullAddress}</p>
                  {office.addressNepali && (
                    <p className="text-sm text-foreground-muted nepali-text mt-1">
                      {office.addressNepali}
                    </p>
                  )}
                </div>

                {/* Location Breakdown */}
                {/* <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {office.location?.province && (
                    <div className="p-3 bg-surface rounded-lg">
                      <p className="text-xs text-foreground-muted">
                        Province
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {office.location.province.name}
                      </p>
                    </div>
                  )}
                  {office.location?.district && (
                    <div className="p-3 bg-surface rounded-lg">
                      <p className="text-xs text-foreground-muted">
                        District
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {office.location.district.name}
                      </p>
                    </div>
                  )}
                  {office.location?.municipality && (
                    <div className="p-3 bg-surface rounded-lg">
                      <p className="text-xs text-foreground-muted">
                        Municipality
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        {office.location.municipality.name}
                      </p>
                    </div>
                  )}
                  {office.location?.ward && (
                    <div className="p-3 bg-surface rounded-lg">
                      <p className="text-xs text-foreground-muted">
                        Ward
                      </p>
                      <p className="text-sm font-medium text-foreground">
                        Ward {office.location.ward.number}
                      </p>
                    </div>
                  )}
                </div> */}

                {/* Map Actions */}
                <div className="flex gap-3">
                  {office.mapUrl ? (
                    <Button asChild>
                      <a
                        href={office.mapUrl.includes('embed') ? office.mapUrl.replace('/embed', '/place') : office.mapUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Get Directions
                      </a>
                    </Button>
                  ) : (
                    <Button asChild>
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress + ', Nepal')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Navigation className="w-4 h-4 mr-2" />
                        Find on Map
                      </a>
                    </Button>
                  )}
                  <Button variant="outline">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Address
                  </Button>
                </div>

                {/* Embedded Map - Always visible */}
                <div className="mt-4 rounded-xl overflow-hidden border border-border shadow-sm">
                  {office.mapUrl && (office.mapUrl.includes('embed') || office.mapUrl.includes('maps.google.com/maps?')) ? (
                    // Google Maps embed URL provided
                    <iframe
                      src={office.mapUrl.includes('embed') ? office.mapUrl : office.mapUrl.replace('maps.google.com/maps?', 'maps.google.com/maps?output=embed&')}
                      width="100%"
                      height="300"
                      style={{ border: 0 }}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />
                  ) : (
                    // Use OpenStreetMap as fallback (free, no API key needed)
                    <>
                      <iframe
                        src={`https://www.openstreetmap.org/export/embed.html?bbox=85.2%2C27.6%2C85.4%2C27.8&layer=mapnik&marker=27.7172%2C85.324`}
                        width="100%"
                        height="280"
                        style={{ border: 0 }}
                        loading="lazy"
                      />
                      <div className="p-3 bg-surface border-t border-border flex justify-between items-center">
                        <span className="text-sm text-foreground-secondary flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {fullAddress}
                        </span>
                        <a
                          href={office.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(fullAddress + ', Nepal')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-primary-blue hover:underline font-medium"
                        >
                          Open in Google Maps →
                        </a>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Contact Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-primary-blue" />
                  Contact Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {office.contact && (
                    <div className="flex items-center gap-3 p-4 bg-surface rounded-lg">
                      <Phone className="w-5 h-5 text-foreground-muted" />
                      <div>
                        <p className="text-xs text-foreground-muted">
                          Phone
                        </p>
                        <a
                          href={`tel:${office.contact}`}
                          className="text-foreground hover:text-primary-crimson"
                        >
                          {office.contact}
                        </a>
                      </div>
                    </div>
                  )}
                  {office.email && (
                    <div className="flex items-center gap-3 p-4 bg-surface rounded-lg">
                      <Mail className="w-5 h-5 text-foreground-muted" />
                      <div>
                        <p className="text-xs text-foreground-muted">
                          Email
                        </p>
                        <a
                          href={`mailto:${office.email}`}
                          className="text-foreground hover:text-primary-crimson"
                        >
                          {office.email}
                        </a>
                      </div>
                    </div>
                  )}
                  {office.website && (
                    <div className="flex items-center gap-3 p-4 bg-surface rounded-lg">
                      <Globe className="w-5 h-5 text-foreground-muted" />
                      <div>
                        <p className="text-xs text-foreground-muted">
                          Website
                        </p>
                        <a
                          href={office.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-foreground hover:text-primary-crimson flex items-center gap-1"
                        >
                          Visit Website
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      </div>
                    </div>
                  )}
                </div>

                {!office.contact && !office.email && !office.website && (
                  <p className="text-foreground-secondary text-center py-4">
                    No contact information available.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Working Hours */}
            {office.workingHours && office.workingHours.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-500" />
                    Working Hours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {office.workingHours.map((hours, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between p-3 bg-surface rounded-lg"
                      >
                        <span className="font-medium text-foreground">
                          {hours.day}
                        </span>
                        <span className="text-foreground-secondary">
                          {hours.isHoliday
                            ? "Closed"
                            : `${hours.openTime} - ${hours.closeTime}`}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Services Available */}
            {/* {office.services && office.services.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="w-5 h-5" />
                    Services Available
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {office.services.slice(0, 10).map((service) => (
                    <Link
                      key={service.id}
                      href={`/services/${service.slug}`}
                      className="block p-3 rounded-lg bg-surface hover:bg-surface-hover transition-colors"
                    >
                      <p className="text-sm font-medium text-foreground">
                        {service.name}
                      </p>
                    </Link>
                  ))}
                  {office.services.length > 10 && (
                    <p className="text-sm text-foreground-muted text-center py-2">
                      +{office.services.length - 10} more services
                    </p>
                  )}
                </CardContent>
              </Card>
            )} */}

            {/* Quick Actions */}
            <Card className="bg-linear-to-br from-nepal-crimson-50 to-nepal-crimson-100 border-nepal-crimson-200">
              <CardContent className="p-6 text-center">
                <Building2 className="w-10 h-10 text-primary-crimson mx-auto mb-3" />
                <p className="font-medium text-foreground mb-2">
                  Planning to Visit?
                </p>
                <p className="text-sm text-foreground-secondary mb-4">
                  Check working hours and required documents before visiting.
                </p>
                <Button asChild className="w-full">
                  <Link href="/services">Browse Services</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
