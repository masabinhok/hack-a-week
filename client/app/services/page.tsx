// ============================================
// FILE: app/services/page.tsx
// DESCRIPTION: All services listing page
// ============================================

import type { Metadata } from "next";
import Link from "next/link";
import { getRootServices, getCategories } from "@/lib/api";
import { BreadcrumbTrail, PriorityBadge, CategoryIcon } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Search,
  Globe,
  FileText,
  Clock,
  ChevronRight,
  Filter,
} from "lucide-react";

export const metadata: Metadata = {
  title: "All Government Services",
  description:
    "Browse all government services available in Nepal. Find step-by-step guides for citizenship, passport, driving license, business registration, and more.",
};

export default async function ServicesPage() {
  // Fetch services and categories in parallel
  const [services, categories] = await Promise.all([
    getRootServices().catch(() => [] as Awaited<ReturnType<typeof getRootServices>>),
    getCategories().catch(() => [] as Awaited<ReturnType<typeof getCategories>>),
  ]);

  // Group services by category
  const servicesByCategory = services.reduce((acc, service) => {
    const categorySlug = service.categories?.[0]?.slug || "other";
    const categoryName = service.categories?.[0]?.name || "Other Services";
    if (!acc[categorySlug]) {
      acc[categorySlug] = {
        name: categoryName,
        services: [],
      };
    }
    acc[categorySlug].services.push(service);
    return acc;
  }, {} as Record<string, { name: string; services: typeof services }>);

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
  ];

  return (
    <main className="flex-1 py-8 md:py-12">
      <div className="container-custom">
        {/* Breadcrumb */}
        <BreadcrumbTrail items={breadcrumbs} className="mb-6" />

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Government Services
          </h1>
          <p className="text-lg text-foreground-secondary max-w-2xl">
            Find detailed step-by-step guides for all government services in
            Nepal. Select a service to see required documents, fees, and office
            locations.
          </p>
        </div>

        {/* Search & Filters */}
        <div className="mb-8 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
            <Input
              type="text"
              placeholder="Search services..."
              className="pl-10"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            <Badge
              variant="secondary"
              className="cursor-pointer hover:bg-nepal-crimson-100"
            >
              All Services
            </Badge>
            {categories.slice(0, 4).map((category) => (
              <Link key={category.id} href={`/categories/${category.slug}`}>
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-surface-hover"
                >
                  {category.name}
                </Badge>
              </Link>
            ))}
          </div>
        </div>

        {/* Services by Category */}
        {Object.entries(servicesByCategory).map(([slug, { name, services }]) => (
          <section key={slug} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-nepal-blue-100 to-nepal-blue-200 flex items-center justify-center text-primary-blue">
                <CategoryIcon categorySlug={slug} className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">
                  {name}
                </h2>
                <p className="text-sm text-foreground-muted">
                  {services.length} services
                </p>
              </div>
              <Link
                href={`/categories/${slug}`}
                className="ml-auto text-sm text-primary-blue hover:underline"
              >
                View all
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {services.slice(0, 6).map((service, index) => (
                <Link
                  key={service.id}
                  href={`/services/${service.slug}`}
                  className="group animate-fade-in opacity-0"
                  style={{
                    animationDelay: `${index * 50}ms`,
                    animationFillMode: "forwards",
                  }}
                >
                  <Card className="h-full transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group-hover:border-primary-crimson">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-3">
                        <h3 className="font-semibold text-foreground group-hover:text-primary-crimson transition-colors line-clamp-2">
                          {service.name}
                        </h3>
                        <ChevronRight className="w-4 h-4 text-foreground-muted group-hover:text-primary-crimson flex-shrink-0" />
                      </div>

                      {service.nameNepali && (
                        <p className="text-xs text-foreground-muted nepali-text mb-3 line-clamp-1">
                          {service.nameNepali}
                        </p>
                      )}

                      <div className="flex flex-wrap gap-2">
                        {service.priority && (
                          <PriorityBadge priority={service.priority} size="sm" />
                        )}
                        {service.isOnlineAvailable && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-green-100 text-green-700"
                          >
                            <Globe className="w-3 h-3 mr-1" />
                            Online
                          </Badge>
                        )}
                        {service._count?.steps && (
                          <Badge variant="outline" className="text-xs">
                            <FileText className="w-3 h-3 mr-1" />
                            {service._count.steps} steps
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        ))}

        {services.length === 0 && (
          <div className="text-center py-16 bg-surface rounded-2xl">
            <FileText className="w-12 h-12 text-foreground-muted mx-auto mb-4" />
            <p className="text-foreground-secondary">
              No services available at the moment.
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
