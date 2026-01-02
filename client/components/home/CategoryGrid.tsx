// ============================================
// FILE: components/home/CategoryGrid.tsx
// DESCRIPTION: Service categories grid section
// ============================================

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { CategoryIcon } from "@/components/shared/CategoryIcon";
import type { Category } from "@/lib/types";

interface CategoryGridProps {
  categories: Category[];
}

export function CategoryGrid({ categories }: CategoryGridProps) {
  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="container-custom">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
            Browse by Category
          </h2>
          <p className="text-foreground-secondary">
            Explore government services organized by category. Click on a
            category to view all available services.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {categories.map((category, index) => (
            <Link
              key={category.id}
              href={`/categories/${category.slug}`}
              className="group"
              style={{
                animationDelay: `${index * 50}ms`,
              }}
            >
              <Card
                variant="interactive"
                className="h-full animate-fade-in opacity-0"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animationFillMode: "forwards",
                }}
              >
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <CategoryIcon
                      categorySlug={category.slug}
                      size="lg"
                      color={category.color}
                      className="shrink-0 group-hover:scale-110 transition-transform duration-200"
                    />
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground mb-1 group-hover:text-nepal-blue transition-colors">
                        {category.name}
                      </h3>
                      {category.nameNepali && (
                        <p className="text-sm text-foreground-muted nepali-text mb-2">
                          {category.nameNepali}
                        </p>
                      )}
                      {category.serviceCount !== undefined && (
                        <p className="text-sm text-foreground-secondary">
                          {category.serviceCount} services
                        </p>
                      )}
                    </div>
                    <ArrowRight className="w-5 h-5 text-foreground-muted group-hover:text-nepal-blue group-hover:translate-x-1 transition-all shrink-0" />
                  </div>
                  {category.description && (
                    <p className="text-sm text-foreground-secondary mt-4 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* View All Link */}
        <div className="text-center mt-8">
          <Link
            href="/categories"
            className="inline-flex items-center gap-2 text-nepal-blue font-medium hover:underline"
          >
            View all categories
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default CategoryGrid;
