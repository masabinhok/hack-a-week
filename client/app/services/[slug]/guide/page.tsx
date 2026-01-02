// ============================================
// FILE: app/services/[slug]/guide/page.tsx
// DESCRIPTION: Dedicated service guide page using the /services/:slug/guide API endpoint
// ============================================

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceGuide } from "@/lib/api";
import { BreadcrumbTrail, PriorityBadge } from "@/components/shared";
import { StepTimeline, ServiceSidebar } from "@/components/services";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Share2,
  Printer,
  Bookmark,
  ArrowLeft,
  FileText,
  Clock,
  AlertCircle,
} from "lucide-react";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  let service = null;
  try {
    service = await getServiceGuide(slug);
  } catch {
    return {
      title: "Service Guide Not Found",
    };
  }

  return {
    title: `${service.name} - Complete Guide`,
    description: service.description || `Step-by-step guide for ${service.name}. Find required documents, fees, process steps, and office locations.`,
    openGraph: {
      title: `${service.name} - Step by Step Guide`,
      description: service.description || `Learn how to apply for ${service.name} in Nepal with our comprehensive guide.`,
    },
  };
}

export default async function ServiceGuidePage({ params }: PageProps) {
  const { slug } = await params;

  let service = null;
  try {
    service = await getServiceGuide(slug);
  } catch (error) {
    console.error("Failed to fetch service guide:", error);
    notFound();
  }

  if (!service) {
    notFound();
  }

  // Build breadcrumbs using the breadcrumb data from API
  const breadcrumbs = [
    { label: "Services", href: "/services" },
    ...(service.breadcrumb || []).map((item) => ({
      label: item.name,
      href: `/services/${item.slug}`,
    })),
    { label: "Guide", href: `/services/${slug}/guide` },
  ];

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

  return (
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

        {/* Service Header */}
        <div className="mb-8 pb-8 border-b border-border">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                  {service.name}
                </h1>
                {service.priority && (
                  <PriorityBadge priority={service.priority} />
                )}
                {service.isOnlineEnabled && (
                  <Badge className="bg-green-100 text-green-700 border-green-200">
                    <Globe className="w-3 h-3 mr-1" />
                    Online Available
                  </Badge>
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
                  <p className="text-xs text-foreground-secondary">
                    Total fees
                  </p>
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
                  <p className="font-medium text-green-900 mb-1">
                    Apply Online
                  </p>
                  <p className="text-sm text-green-700 mb-3">
                    This service is available online. You can apply through the official portal.
                  </p>
                  <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                    <a href={service.onlinePortalUrl} target="_blank" rel="noopener noreferrer">
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
                  <p className="font-medium text-blue-900 mb-1">
                    Eligibility
                  </p>
                  <p className="text-sm text-blue-700">
                    {service.eligibility}
                  </p>
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
              <StepTimeline steps={service.steps} />
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
            <ServiceSidebar
              service={service}
              className="sticky top-24"
            />
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
              Last Updated: {new Date(service.metadata.lastUpdated).toLocaleDateString()}
              {service.metadata.dataSource && ` • Source: ${service.metadata.dataSource}`}
              {service.metadata.verifiedBy && ` • Verified by: ${service.metadata.verifiedBy}`}
            </p>
          </section>
        )}
      </div>
    </main>
  );
}
