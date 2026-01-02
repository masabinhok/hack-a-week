// ============================================
// FILE: app/categories/page.tsx
// DESCRIPTION: Categories listing page
// ============================================

import type { Metadata } from "next";
import Link from "next/link";
import { getCategories } from "@/lib/api";
import { BreadcrumbTrail } from "@/components/shared";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryIcon } from "@/components/shared";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "Service Categories",
  description:
    "Browse all government service categories in Nepal. Find citizenship, passport, license, land registration, business, and other government services.",
};

export default async function CategoriesPage() {
  let categories: Awaited<ReturnType<typeof getCategories>> = [];
  let error: string | null = null;

  try {
    categories = await getCategories();
  } catch {
    error = "Failed to fetch categories";
  }

  const breadcrumbs = [
    { label: "Categories", href: "/categories" },
  ];

  return (
    <main className="flex-1 py-8 md:py-12">
      <div className="container-custom">
        {/* Breadcrumb */}
        <BreadcrumbTrail items={breadcrumbs} className="mb-6" />

        {/* Page Header */}
        <div className="mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Service Categories
          </h1>
          <p className="text-lg text-foreground-secondary max-w-2xl">
            Browse government services by category. Select a category to see all
            available services and their detailed procedures.
          </p>
        </div>

        {/* Error State */}
        {error && (
          <div className="text-center py-12">
            <p className="text-error mb-4">
              Unable to load categories. Please try again later.
            </p>
          </div>
        )}

        {/* Categories Grid */}
        {categories && categories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((category, index) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="group animate-fade-in opacity-0"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <Card className="h-full transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group-hover:border-primary-crimson">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      {/* Icon */}
                      <div className="flex-shrink-0 w-14 h-14 rounded-xl bg-gradient-to-br from-nepal-blue-100 to-nepal-blue-200 flex items-center justify-center text-primary-blue group-hover:from-nepal-crimson-100 group-hover:to-nepal-crimson-200 group-hover:text-primary-crimson transition-colors">
                        <CategoryIcon
                          categorySlug={category.slug}
                          className="w-7 h-7"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <h2 className="text-lg font-semibold text-foreground group-hover:text-primary-crimson transition-colors mb-1">
                          {category.name}
                        </h2>
                        {category.nameNepali && (
                          <p className="text-sm text-foreground-muted nepali-text mb-2">
                            {category.nameNepali}
                          </p>
                        )}
                        {category.description && (
                          <p className="text-sm text-foreground-secondary line-clamp-2">
                            {category.description}
                          </p>
                        )}

                        {/* Service Count & Arrow */}
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-border">
                          <span className="text-sm text-foreground-muted">
                            {category.serviceCount || 0} services
                          </span>
                          <ArrowRight className="w-4 h-4 text-foreground-muted group-hover:text-primary-crimson group-hover:translate-x-1 transition-all" />
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        ) : (
          !error && (
            <div className="text-center py-16 bg-surface rounded-2xl">
              <p className="text-foreground-secondary">
                No categories available at the moment.
              </p>
            </div>
          )
        )}
      </div>
    </main>
  );
}
