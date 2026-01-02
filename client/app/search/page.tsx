// ============================================
// FILE: app/search/page.tsx
// DESCRIPTION: Search results page
// ============================================

import type { Metadata } from "next";
import Link from "next/link";
import { searchServices } from "@/lib/api";
import { BreadcrumbTrail, PriorityBadge, CategoryIcon } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search,
  Globe,
  FileText,
  ChevronRight,
  SearchX,
  ArrowRight,
} from "lucide-react";

interface PageProps {
  searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: PageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: ${q}` : "Search Services",
    description: q
      ? `Search results for "${q}" - Find government services in Nepal`
      : "Search for government services in Nepal",
  };
}

export default async function SearchPage({ searchParams }: PageProps) {
  const { q: query } = await searchParams;

  let results: Awaited<ReturnType<typeof searchServices>> = [];
  if (query) {
    try {
      results = await searchServices(query);
    } catch {
      results = [];
    }
  }

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: "Search", href: "/search" },
  ];

  return (
    <main className="flex-1 py-8 md:py-12">
      <div className="container-custom">
        {/* Breadcrumb */}
        <BreadcrumbTrail items={breadcrumbs} className="mb-6" />

        {/* Search Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Search Services
          </h1>
          <p className="text-lg text-foreground-secondary max-w-2xl mb-6">
            Find the government service you need by searching for keywords like
            "citizenship", "passport", "license", or any service name.
          </p>

          {/* Search Form */}
          <form action="/search" method="GET" className="max-w-2xl">
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-foreground-muted" />
                <Input
                  type="text"
                  name="q"
                  defaultValue={query || ""}
                  placeholder="Search for services..."
                  className="pl-12 h-12 text-lg"
                  autoFocus
                />
              </div>
              <Button type="submit" size="lg" className="px-8">
                Search
              </Button>
            </div>
          </form>
        </div>

        {/* Search Results */}
        {query ? (
          <div>
            {/* Results Header */}
            <div className="flex items-center justify-between mb-6">
              <p className="text-foreground-secondary">
                {results && results.length > 0 ? (
                  <>
                    Found <span className="font-semibold">{results.length}</span>{" "}
                    results for{" "}
                    <span className="font-semibold">&quot;{query}&quot;</span>
                  </>
                ) : (
                  <>
                    No results found for{" "}
                    <span className="font-semibold">&quot;{query}&quot;</span>
                  </>
                )}
              </p>
            </div>

            {/* Results Grid */}
            {results && results.length > 0 ? (
              <div className="space-y-4">
                {results.map((service, index) => (
                  <Link
                    key={service.id}
                    href={`/services/${service.slug}`}
                    className="block group animate-fade-in opacity-0"
                    style={{
                      animationDelay: `${index * 50}ms`,
                      animationFillMode: "forwards",
                    }}
                  >
                    <Card className="transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group-hover:border-primary-crimson">
                      <CardContent className="p-5">
                        <div className="flex items-start gap-4">
                          {/* Category Icon */}
                          <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-surface flex items-center justify-center text-primary-blue">
                            <CategoryIcon
                              categorySlug={
                                service.categories?.[0]?.category?.slug || "other"
                              }
                              className="w-6 h-6"
                            />
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h2 className="text-lg font-semibold text-foreground group-hover:text-primary-crimson transition-colors mb-1">
                                  {service.name}
                                </h2>
                                {service.nameNepali && (
                                  <p className="text-sm text-foreground-muted nepali-text mb-2">
                                    {service.nameNepali}
                                  </p>
                                )}
                              </div>
                              <ChevronRight className="w-5 h-5 text-foreground-muted group-hover:text-primary-crimson group-hover:translate-x-1 transition-all flex-shrink-0" />
                            </div>

                            {service.description && (
                              <p className="text-sm text-foreground-secondary line-clamp-2 mb-3">
                                {service.description}
                              </p>
                            )}

                            <div className="flex flex-wrap gap-2">
                              {service.categories?.[0]?.category && (
                                <Badge variant="outline" className="text-xs">
                                  {service.categories[0].category.name}
                                </Badge>
                              )}
                              {service.priority && (
                                <PriorityBadge
                                  priority={service.priority}
                                  size="sm"
                                />
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
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-surface rounded-2xl">
                <SearchX className="w-16 h-16 text-foreground-muted mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-foreground mb-2">
                  No services found
                </h2>
                <p className="text-foreground-secondary mb-6 max-w-md mx-auto">
                  We couldn&apos;t find any services matching your search. Try different
                  keywords or browse our categories.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button asChild variant="outline">
                    <Link href="/categories">Browse Categories</Link>
                  </Button>
                  <Button asChild>
                    <Link href="/services">
                      View All Services
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Link>
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* No Query - Show Popular Searches */
          <div>
            <h2 className="text-xl font-semibold text-foreground mb-4">
              Popular Searches
            </h2>
            <div className="flex flex-wrap gap-3">
              {[
                "Citizenship",
                "Passport",
                "Driving License",
                "Birth Certificate",
                "Marriage Registration",
                "Land Registration",
                "Business Registration",
                "Tax Clearance",
              ].map((term) => (
                <Link
                  key={term}
                  href={`/search?q=${encodeURIComponent(term)}`}
                  className="px-4 py-2 rounded-full bg-surface hover:bg-surface-hover text-foreground-secondary hover:text-primary-crimson transition-colors"
                >
                  {term}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
