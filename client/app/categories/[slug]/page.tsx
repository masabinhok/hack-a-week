// ============================================
// FILE: app/categories/[slug]/page.tsx
// DESCRIPTION: Individual category page with services list
// ============================================

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getServicesByCategory } from "@/lib/api";
import { BreadcrumbTrail, CategoryIcon, PriorityBadge } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  FileText,
  Globe,
  ChevronRight,
} from "lucide-react";

// Force dynamic rendering to avoid build-time API calls
export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  
  let category = null;
  try {
    category = await getCategoryBySlug(slug);
  } catch {
    // Category not found
  }

  if (!category) {
    return {
      title: "Category Not Found",
    };
  }

  return {
    title: `${category.name} Services`,
    description:
      category.description ||
      `Browse all ${category.name} government services in Nepal. Find procedures, required documents, fees, and office locations.`,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params;

  // Fetch category and services in parallel
  let category = null;
  let services: Awaited<ReturnType<typeof getServicesByCategory>> = [];

  try {
    [category, services] = await Promise.all([
      getCategoryBySlug(slug),
      getServicesByCategory(slug),
    ]);
  } catch {
    // Handle errors
  }

  if (!category) {
    notFound();
  }

  const breadcrumbs = [
    { label: "Categories", href: "/categories" },
    { label: category.name, href: `/categories/${slug}` },
  ];

  // Separate parent services and sub-services
  const parentServices = services.filter((s) => !s.parentId);
  const subServicesMap = services
    .filter((s) => s.parentId)
    .reduce((acc, service) => {
      const parentId = service.parentId!;
      if (!acc[parentId]) {
        acc[parentId] = [];
      }
      acc[parentId].push(service);
      return acc;
    }, {} as Record<string, typeof services>);

  return (
    <main className="flex-1 py-8 md:py-12">
      <div className="container-custom">
        {/* Breadcrumb */}
        <BreadcrumbTrail items={breadcrumbs} className="mb-6" />

        {/* Category Header */}
        <div className="mb-10 flex items-start gap-6">
          <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-gradient-to-br from-nepal-blue-100 to-nepal-blue-200 flex items-center justify-center text-primary-blue">
            <CategoryIcon categorySlug={slug} className="w-10 h-10" />
          </div>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {category.name}
            </h1>
            {category.nameNepali && (
              <p className="text-lg text-foreground-muted nepali-text mb-2">
                {category.nameNepali}
              </p>
            )}
            {category.description && (
              <p className="text-foreground-secondary max-w-2xl">
                {category.description}
              </p>
            )}
            <p className="text-sm text-foreground-muted mt-3">
              {services.length} services available
            </p>
          </div>
        </div>

        {/* Services List */}
        {parentServices.length > 0 ? (
          <div className="space-y-6">
            {parentServices.map((service, index) => {
              const subServices: typeof services = subServicesMap[service.id] || [];
              const hasSubServices = subServices.length > 0;

              return (
                <Card
                  key={service.id}
                  className="overflow-hidden animate-fade-in opacity-0"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: "forwards",
                  }}
                >
                  <CardContent className="p-0">
                    {/* Main Service */}
                    <Link
                      href={`/services/${service.slug}`}
                      className="block p-6 hover:bg-surface-hover transition-colors group"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center gap-2 mb-2">
                            <h2 className="text-xl font-semibold text-foreground group-hover:text-primary-crimson transition-colors">
                              {service.name}
                            </h2>
                            {service.priority && (
                              <PriorityBadge priority={service.priority} />
                            )}
                            {service.isOnlineEnabled && (
                              <Badge
                                variant="secondary"
                                className="bg-green-100 text-green-700"
                              >
                                <Globe className="w-3 h-3 mr-1" />
                                Online
                              </Badge>
                            )}
                          </div>

                          {service.nameNepali && (
                            <p className="text-sm text-foreground-muted nepali-text mb-2">
                              {service.nameNepali}
                            </p>
                          )}

                          {service.description && (
                            <p className="text-foreground-secondary line-clamp-2 mb-4">
                              {service.description}
                            </p>
                          )}

                          {/* Quick Info */}
                          <div className="flex flex-wrap items-center gap-4 text-sm text-foreground-muted">
                            {service.stepsCount && (
                              <span className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                {service.stepsCount} steps
                              </span>
                            )}
                            {service.childrenCount && service.childrenCount > 0 && (
                              <span className="flex items-center gap-1">
                                <FileText className="w-4 h-4" />
                                {service.childrenCount} sub-services
                              </span>
                            )}
                          </div>
                        </div>

                        <ChevronRight className="w-5 h-5 text-foreground-muted group-hover:text-primary-crimson group-hover:translate-x-1 transition-all flex-shrink-0 mt-1" />
                      </div>
                    </Link>

                    {/* Sub-services */}
                    {hasSubServices && (
                      <div className="border-t border-border bg-surface">
                        <div className="p-4">
                          <p className="text-sm font-medium text-foreground-muted mb-3">
                            Related Services ({subServices.length})
                          </p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                            {subServices.map((subService) => (
                              <Link
                                key={subService.id}
                                href={`/services/${subService.slug}`}
                                className="flex items-center gap-2 p-3 rounded-lg hover:bg-background transition-colors group/sub"
                              >
                                <span className="flex-1 text-sm text-foreground-secondary group-hover/sub:text-primary-crimson">
                                  {subService.name}
                                </span>
                                <ArrowRight className="w-4 h-4 text-foreground-muted group-hover/sub:text-primary-crimson opacity-0 group-hover/sub:opacity-100 transition-all" />
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-16 bg-surface rounded-2xl">
            <FileText className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
            <p className="text-foreground-secondary mb-4">
              No services available in this category yet.
            </p>
            <Button asChild variant="outline">
              <Link href="/categories">Browse Other Categories</Link>
            </Button>
          </div>
        )}
      </div>
    </main>
  );
}
