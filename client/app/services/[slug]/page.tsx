// ============================================
// FILE: app/services/[slug]/page.tsx
// DESCRIPTION: Individual service detail page with step-by-step guide
// ============================================

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getServiceGuide, getOfficesForService } from "@/lib/api";
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
  Building2,
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
    // Service not found
  }

  if (!service) {
    return {
      title: "Service Not Found",
    };
  }

  return {
    title: service.name,
    description:
      service.description ||
      `Complete guide for ${service.name} in Nepal. Find required documents, fees, process steps, and office locations.`,
    openGraph: {
      title: `${service.name} - Step by Step Guide`,
      description:
        service.description ||
        `Learn how to apply for ${service.name} in Nepal with our comprehensive guide.`,
    },
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch service guide and offices in parallel
  let service = null;
  let offices: Awaited<ReturnType<typeof getOfficesForService>> = [];

  try {
    [service, offices] = await Promise.all([
      getServiceGuide(slug),
      getOfficesForService(slug),
    ]);
  } catch {
    // Handle errors
  }

  if (!service) {
    notFound();
  }

  const category = service.categories?.[0];

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    ...(category
      ? [{ label: category.name, href: `/categories/${category.slug}` }]
      : []),
    { label: service.name, href: `/services/${slug}` },
  ];

  return (
    <main className="flex-1 py-8 md:py-12">
      <div className="container-custom">
        {/* Breadcrumb */}
        <BreadcrumbTrail items={breadcrumbs} className="mb-6" />

        {/* Back Button */}
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link href={category ? `/categories/${category.slug}` : "/services"}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to {category?.name || "Services"}
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
                {service.isOnlineAvailable && (
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
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-foreground-secondary">
              <FileText className="w-4 h-4 text-primary-blue" />
              <span>{service.steps?.length || 0} steps</span>
            </div>
            {service.estimatedTime && (
              <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                <Clock className="w-4 h-4 text-purple-500" />
                <span>{service.estimatedTime}</span>
              </div>
            )}
            {offices.length > 0 && (
              <div className="flex items-center gap-2 text-sm text-foreground-secondary">
                <Building2 className="w-4 h-4 text-amber-500" />
                <span>{offices.length} offices</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Step Timeline */}
          <div className="lg:col-span-2">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Step-by-Step Process
            </h2>
            <StepTimeline steps={service.steps || []} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <ServiceSidebar
              service={service}
              offices={offices}
              className="sticky top-24"
            />
          </div>
        </div>

        {/* Related Services */}
        {service.children && service.children.length > 0 && (
          <section className="mt-16 pt-8 border-t border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Related Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {service.children.map((child) => (
                <Link
                  key={child.id}
                  href={`/services/${child.slug}`}
                  className="p-4 rounded-lg border border-border hover:border-primary-crimson hover:shadow-md transition-all"
                >
                  <p className="font-medium text-foreground">
                    {child.name}
                  </p>
                  {child.nameNepali && (
                    <p className="text-sm text-foreground-muted nepali-text">
                      {child.nameNepali}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}
