// ============================================
// FILE: app/services/[slug]/page.tsx
// DESCRIPTION: Individual service detail page with step-by-step guide
// ============================================

import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getServiceBySlug } from "@/lib/api";
import type { Service } from "@/lib/types";
import { BreadcrumbTrail, PriorityBadge } from "@/components/shared";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Globe,
  Share2,
  Printer,
  Bookmark,
  ArrowLeft,
} from "lucide-react";

// Force dynamic rendering to avoid build-time API calls
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  let service = null;
  try {
    // Use getServiceBySlug for metadata as it works for both parent and leaf services
    service = await getServiceBySlug(slug);
  } catch {
    // Service not found
  }

  if (!service) {
    return {
      title: "Service Not Found",
    };
  }

  const hasChildren = service.children && service.children.length > 0;
  const descriptionSuffix = hasChildren 
    ? `Browse available ${service.name.toLowerCase()} services in Nepal.`
    : `Learn how to get ${service.name.toLowerCase()} in Nepal.`;

  return {
    title: service.name,
    description: service.description || descriptionSuffix,
    openGraph: {
      title: `${service.name} - Services`,
      description:
        service.description ||
        `Explore all ${service.name.toLowerCase()} services available in Nepal.`,
    },
  };
}

export default async function ServiceDetailPage({ params }: PageProps) {
  const { slug } = await params;

  // First fetch basic service info to check if it's a leaf or parent service
  let serviceBasic = null;
  try {
    serviceBasic = await getServiceBySlug(slug);
  } catch {
    notFound();
  }

  if (!serviceBasic) {
    notFound();
  }

  // Check if this is a leaf service (no children) or parent service
  const isLeafService = !serviceBasic.children || serviceBasic.children.length === 0;

  // Redirect leaf services to the guide page
  if (isLeafService) {
    redirect(`/services/${slug}/guide`);
  }

  // For parent services, use the basic info
  const service = serviceBasic as any;

  const category = service.categories?.[0];

  const breadcrumbs = [
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
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-2 text-sm text-foreground-secondary">
              <span>{service.children?.length || 0} services available</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <section className="mb-12">
          <h2 className="text-xl font-bold text-foreground mb-6">
            Available Services
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {service.children && service.children.map((child: Service) => (
              <Link
                key={child.id}
                href={`/services/${child.slug}`}
                className="p-6 rounded-lg border border-border hover:border-primary-crimson hover:shadow-md transition-all"
              >
                <p className="font-medium text-foreground mb-2">
                  {child.name}
                </p>
                {child.nameNepali && (
                  <p className="text-sm text-foreground-muted nepali-text">
                    {child.nameNepali}
                  </p>
                )}
                {child.description && (
                  <p className="text-sm text-foreground-secondary mt-2">
                    {child.description}
                  </p>
                )}
              </Link>
            ))}
          </div>
        </section>

        {/* Related Services (only for leaf services with children) */}
        {service.children && service.children.length > 0 && (
          <section className="mt-16 pt-8 border-t border-border">
            <h2 className="text-xl font-bold text-foreground mb-6">
              Related Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {service.children.map((child: Service) => (
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
